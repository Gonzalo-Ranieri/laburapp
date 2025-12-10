import { supabaseAdmin } from "../supabase/client"
import { redisService } from "../cache/redis-service"
import os from "os"
import { performance } from "perf_hooks"

export interface SystemMetrics {
  timestamp: Date
  cpu: {
    usage: number
    loadAverage: number[]
    cores: number
  }
  memory: {
    total: number
    used: number
    free: number
    usage: number
  }
  disk: {
    total: number
    used: number
    free: number
    usage: number
  }
  network: {
    bytesReceived: number
    bytesSent: number
  }
  process: {
    pid: number
    uptime: number
    memoryUsage: NodeJS.MemoryUsage
    cpuUsage: NodeJS.CpuUsage
  }
}

export interface DatabaseMetrics {
  connections: {
    active: number
    idle: number
    total: number
  }
  queries: {
    total: number
    slow: number
    failed: number
    averageTime: number
  }
  storage: {
    size: number
    tables: number
    indexes: number
  }
}

export interface RedisMetrics {
  memory: {
    used: number
    peak: number
    total: number
  }
  connections: {
    connected: number
    blocked: number
  }
  operations: {
    commands: number
    hits: number
    misses: number
    hitRate: number
  }
  keyspace: {
    keys: number
    expires: number
    avgTtl: number
  }
}

export interface AlertRule {
  id: string
  name: string
  metric: string
  operator: "gt" | "lt" | "eq" | "gte" | "lte"
  threshold: number
  duration: number // seconds
  severity: "low" | "medium" | "high" | "critical"
  enabled: boolean
  channels: string[] // notification channels
}

export interface Alert {
  id: string
  ruleId: string
  metric: string
  value: number
  threshold: number
  severity: string
  message: string
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
}

class SystemMonitor {
  private alerts: Map<string, Alert> = new Map()
  private alertRules: AlertRule[] = []
  private metricsHistory: SystemMetrics[] = []
  private isMonitoring = false
  private monitoringInterval?: NodeJS.Timeout
  private alertCheckInterval?: NodeJS.Timeout

  constructor() {
    this.initializeDefaultAlertRules()
  }

  private initializeDefaultAlertRules() {
    this.alertRules = [
      {
        id: "cpu-high",
        name: "High CPU Usage",
        metric: "cpu.usage",
        operator: "gt",
        threshold: 80,
        duration: 300, // 5 minutes
        severity: "high",
        enabled: true,
        channels: ["email", "slack"],
      },
      {
        id: "memory-high",
        name: "High Memory Usage",
        metric: "memory.usage",
        operator: "gt",
        threshold: 85,
        duration: 180, // 3 minutes
        severity: "high",
        enabled: true,
        channels: ["email", "slack"],
      },
      {
        id: "disk-high",
        name: "High Disk Usage",
        metric: "disk.usage",
        operator: "gt",
        threshold: 90,
        duration: 600, // 10 minutes
        severity: "critical",
        enabled: true,
        channels: ["email", "slack", "sms"],
      },
      {
        id: "redis-memory-high",
        name: "High Redis Memory Usage",
        metric: "redis.memory.used",
        operator: "gt",
        threshold: 1073741824, // 1GB
        duration: 300,
        severity: "medium",
        enabled: true,
        channels: ["email"],
      },
      {
        id: "db-slow-queries",
        name: "High Number of Slow Queries",
        metric: "database.queries.slow",
        operator: "gt",
        threshold: 10,
        duration: 300,
        severity: "medium",
        enabled: true,
        channels: ["email"],
      },
    ]
  }

  async startMonitoring(interval = 60000) {
    // Default 1 minute
    if (this.isMonitoring) {
      console.log("Monitoring already started")
      return
    }

    console.log("Starting system monitoring...")
    this.isMonitoring = true

    // Collect metrics immediately
    await this.collectMetrics()

    // Set up periodic collection
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics()
    }, interval)

    // Set up alert checking (more frequent)
    this.alertCheckInterval = setInterval(async () => {
      await this.checkAlerts()
    }, 30000) // Check every 30 seconds

    console.log(`System monitoring started with ${interval}ms interval`)
  }

  stopMonitoring() {
    if (!this.isMonitoring) {
      console.log("Monitoring not running")
      return
    }

    console.log("Stopping system monitoring...")
    this.isMonitoring = false

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }

    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval)
      this.alertCheckInterval = undefined
    }

    console.log("System monitoring stopped")
  }

  async collectMetrics(): Promise<SystemMetrics> {
    const startTime = performance.now()

    try {
      const metrics: SystemMetrics = {
        timestamp: new Date(),
        cpu: await this.getCpuMetrics(),
        memory: this.getMemoryMetrics(),
        disk: await this.getDiskMetrics(),
        network: await this.getNetworkMetrics(),
        process: this.getProcessMetrics(),
      }

      // Store in history (keep last 1000 entries)
      this.metricsHistory.push(metrics)
      if (this.metricsHistory.length > 1000) {
        this.metricsHistory.shift()
      }

      // Cache in Redis for real-time access
      await redisService.set("system:metrics:latest", metrics, 300) // 5 minutes TTL

      // Store in database for long-term analysis
      await this.storeMetricsInDatabase(metrics)

      const endTime = performance.now()
      console.log(`Metrics collected in ${(endTime - startTime).toFixed(2)}ms`)

      return metrics
    } catch (error) {
      console.error("Error collecting metrics:", error)
      throw error
    }
  }

  private async getCpuMetrics() {
    return new Promise<{ usage: number; loadAverage: number[]; cores: number }>((resolve) => {
      const startUsage = process.cpuUsage()
      const startTime = process.hrtime()

      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage)
        const endTime = process.hrtime(startTime)

        const totalTime = endTime[0] * 1000000 + endTime[1] / 1000 // microseconds
        const cpuTime = endUsage.user + endUsage.system
        const usage = (cpuTime / totalTime) * 100

        resolve({
          usage: Math.min(100, Math.max(0, usage)),
          loadAverage: os.loadavg(),
          cores: os.cpus().length,
        })
      }, 100) // Sample for 100ms
    })
  }

  private getMemoryMetrics() {
    const total = os.totalmem()
    const free = os.freemem()
    const used = total - free

    return {
      total,
      used,
      free,
      usage: (used / total) * 100,
    }
  }

  private async getDiskMetrics() {
    try {
      // This is a simplified version - in production you'd use a proper disk usage library
      const fs = require("fs").promises
      const stats = await fs.statfs("/")

      const total = stats.blocks * stats.bsize
      const free = stats.bavail * stats.bsize
      const used = total - free

      return {
        total,
        used,
        free,
        usage: (used / total) * 100,
      }
    } catch (error) {
      console.error("Error getting disk metrics:", error)
      return {
        total: 0,
        used: 0,
        free: 0,
        usage: 0,
      }
    }
  }

  private async getNetworkMetrics() {
    try {
      // This would typically come from system network interfaces
      // For now, return placeholder values
      return {
        bytesReceived: 0,
        bytesSent: 0,
      }
    } catch (error) {
      console.error("Error getting network metrics:", error)
      return {
        bytesReceived: 0,
        bytesSent: 0,
      }
    }
  }

  private getProcessMetrics() {
    return {
      pid: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    }
  }

  async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    try {
      // Get connection stats from Supabase
      const { data: connectionStats } = await supabaseAdmin.from("pg_stat_activity").select("state")

      const connections = {
        active: connectionStats?.filter((c) => c.state === "active").length || 0,
        idle: connectionStats?.filter((c) => c.state === "idle").length || 0,
        total: connectionStats?.length || 0,
      }

      // Get query stats
      const { data: queryStats } = await supabaseAdmin
        .from("pg_stat_statements")
        .select("calls, total_time, mean_time")
        .limit(1000)

      const queries = {
        total: queryStats?.reduce((sum, q) => sum + q.calls, 0) || 0,
        slow: queryStats?.filter((q) => q.mean_time > 1000).length || 0,
        failed: 0, // Would need error tracking
        averageTime: queryStats?.reduce((sum, q) => sum + q.mean_time, 0) / (queryStats?.length || 1) || 0,
      }

      // Get storage stats
      const { data: storageStats } = await supabaseAdmin
        .from("pg_database")
        .select("datname, pg_database_size(datname) as size")

      const storage = {
        size: storageStats?.reduce((sum, db) => sum + (db.size || 0), 0) || 0,
        tables: 0, // Would need table count query
        indexes: 0, // Would need index count query
      }

      return { connections, queries, storage }
    } catch (error) {
      console.error("Error getting database metrics:", error)
      return {
        connections: { active: 0, idle: 0, total: 0 },
        queries: { total: 0, slow: 0, failed: 0, averageTime: 0 },
        storage: { size: 0, tables: 0, indexes: 0 },
      }
    }
  }

  async getRedisMetrics(): Promise<RedisMetrics> {
    try {
      const info = await redisService.getInfo()
      const memoryUsage = await redisService.getMemoryUsage()
      const keyCount = await redisService.getKeyCount()

      return {
        memory: {
          used: memoryUsage.used,
          peak: memoryUsage.peak,
          total: memoryUsage.total,
        },
        connections: {
          connected: info.clients?.connected_clients || 0,
          blocked: info.clients?.blocked_clients || 0,
        },
        operations: {
          commands: info.stats?.total_commands_processed || 0,
          hits: info.stats?.keyspace_hits || 0,
          misses: info.stats?.keyspace_misses || 0,
          hitRate: this.calculateHitRate(info.stats?.keyspace_hits || 0, info.stats?.keyspace_misses || 0),
        },
        keyspace: {
          keys: keyCount,
          expires: info.keyspace?.db0?.expires || 0,
          avgTtl: info.keyspace?.db0?.avg_ttl || 0,
        },
      }
    } catch (error) {
      console.error("Error getting Redis metrics:", error)
      return {
        memory: { used: 0, peak: 0, total: 0 },
        connections: { connected: 0, blocked: 0 },
        operations: { commands: 0, hits: 0, misses: 0, hitRate: 0 },
        keyspace: { keys: 0, expires: 0, avgTtl: 0 },
      }
    }
  }

  private calculateHitRate(hits: number, misses: number): number {
    const total = hits + misses
    return total > 0 ? (hits / total) * 100 : 0
  }

  private async storeMetricsInDatabase(metrics: SystemMetrics) {
    try {
      await supabaseAdmin.from("system_metrics").insert({
        timestamp: metrics.timestamp.toISOString(),
        cpu_usage: metrics.cpu.usage,
        memory_usage: metrics.memory.usage,
        disk_usage: metrics.disk.usage,
        load_average: metrics.cpu.loadAverage,
        process_memory: metrics.process.memoryUsage,
        metadata: {
          cpu: metrics.cpu,
          memory: metrics.memory,
          disk: metrics.disk,
          network: metrics.network,
          process: metrics.process,
        },
      })
    } catch (error) {
      console.error("Error storing metrics in database:", error)
    }
  }

  async checkAlerts() {
    try {
      const latestMetrics = await this.getLatestMetrics()
      if (!latestMetrics) return

      const databaseMetrics = await this.getDatabaseMetrics()
      const redisMetrics = await this.getRedisMetrics()

      for (const rule of this.alertRules) {
        if (!rule.enabled) continue

        const value = this.getMetricValue(rule.metric, latestMetrics, databaseMetrics, redisMetrics)
        if (value === null) continue

        const shouldAlert = this.evaluateAlertCondition(rule, value)
        const existingAlert = this.alerts.get(rule.id)

        if (shouldAlert && !existingAlert) {
          // Create new alert
          const alert: Alert = {
            id: `${rule.id}-${Date.now()}`,
            ruleId: rule.id,
            metric: rule.metric,
            value,
            threshold: rule.threshold,
            severity: rule.severity,
            message: `${rule.name}: ${rule.metric} is ${value} (threshold: ${rule.threshold})`,
            timestamp: new Date(),
            resolved: false,
          }

          this.alerts.set(rule.id, alert)
          await this.sendAlert(alert, rule)
          await this.storeAlertInDatabase(alert)
        } else if (!shouldAlert && existingAlert && !existingAlert.resolved) {
          // Resolve existing alert
          existingAlert.resolved = true
          existingAlert.resolvedAt = new Date()

          await this.sendAlertResolution(existingAlert, rule)
          await this.updateAlertInDatabase(existingAlert)
        }
      }
    } catch (error) {
      console.error("Error checking alerts:", error)
    }
  }

  private getMetricValue(
    metric: string,
    systemMetrics: SystemMetrics,
    dbMetrics: DatabaseMetrics,
    redisMetrics: RedisMetrics,
  ): number | null {
    const parts = metric.split(".")

    try {
      if (parts[0] === "cpu") {
        return systemMetrics.cpu[parts[1] as keyof typeof systemMetrics.cpu] as number
      } else if (parts[0] === "memory") {
        return systemMetrics.memory[parts[1] as keyof typeof systemMetrics.memory] as number
      } else if (parts[0] === "disk") {
        return systemMetrics.disk[parts[1] as keyof typeof systemMetrics.disk] as number
      } else if (parts[0] === "database") {
        const section = dbMetrics[parts[1] as keyof DatabaseMetrics] as any
        return section[parts[2]] as number
      } else if (parts[0] === "redis") {
        const section = redisMetrics[parts[1] as keyof RedisMetrics] as any
        return section[parts[2]] as number
      }
    } catch (error) {
      console.error(`Error getting metric value for ${metric}:`, error)
    }

    return null
  }

  private evaluateAlertCondition(rule: AlertRule, value: number): boolean {
    switch (rule.operator) {
      case "gt":
        return value > rule.threshold
      case "gte":
        return value >= rule.threshold
      case "lt":
        return value < rule.threshold
      case "lte":
        return value <= rule.threshold
      case "eq":
        return value === rule.threshold
      default:
        return false
    }
  }

  private async sendAlert(alert: Alert, rule: AlertRule) {
    console.log(`🚨 ALERT: ${alert.message}`)

    // Store alert notification
    await redisService.publish("alerts", {
      type: "new_alert",
      alert,
      rule,
    })

    // Here you would integrate with actual notification services
    for (const channel of rule.channels) {
      switch (channel) {
        case "email":
          await this.sendEmailAlert(alert, rule)
          break
        case "slack":
          await this.sendSlackAlert(alert, rule)
          break
        case "sms":
          await this.sendSmsAlert(alert, rule)
          break
      }
    }
  }

  private async sendAlertResolution(alert: Alert, rule: AlertRule) {
    console.log(`✅ RESOLVED: ${alert.message}`)

    await redisService.publish("alerts", {
      type: "alert_resolved",
      alert,
      rule,
    })
  }

  private async sendEmailAlert(alert: Alert, rule: AlertRule) {
    // Implement email notification
    console.log(`📧 Email alert: ${alert.message}`)
  }

  private async sendSlackAlert(alert: Alert, rule: AlertRule) {
    // Implement Slack notification
    console.log(`💬 Slack alert: ${alert.message}`)
  }

  private async sendSmsAlert(alert: Alert, rule: AlertRule) {
    // Implement SMS notification
    console.log(`📱 SMS alert: ${alert.message}`)
  }

  private async storeAlertInDatabase(alert: Alert) {
    try {
      await supabaseAdmin.from("system_alerts").insert({
        id: alert.id,
        rule_id: alert.ruleId,
        metric: alert.metric,
        value: alert.value,
        threshold: alert.threshold,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp.toISOString(),
        resolved: alert.resolved,
        resolved_at: alert.resolvedAt?.toISOString(),
      })
    } catch (error) {
      console.error("Error storing alert in database:", error)
    }
  }

  private async updateAlertInDatabase(alert: Alert) {
    try {
      await supabaseAdmin
        .from("system_alerts")
        .update({
          resolved: alert.resolved,
          resolved_at: alert.resolvedAt?.toISOString(),
        })
        .eq("id", alert.id)
    } catch (error) {
      console.error("Error updating alert in database:", error)
    }
  }

  async getLatestMetrics(): Promise<SystemMetrics | null> {
    try {
      // Try Redis first for real-time data
      const cached = await redisService.get<SystemMetrics>("system:metrics:latest")
      if (cached) return cached

      // Fallback to in-memory history
      return this.metricsHistory[this.metricsHistory.length - 1] || null
    } catch (error) {
      console.error("Error getting latest metrics:", error)
      return null
    }
  }

  async getMetricsHistory(hours = 24): Promise<SystemMetrics[]> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000)

      const { data, error } = await supabaseAdmin
        .from("system_metrics")
        .select("*")
        .gte("timestamp", since.toISOString())
        .order("timestamp", { ascending: true })

      if (error) {
        console.error("Error getting metrics history:", error)
        return this.metricsHistory.filter((m) => m.timestamp >= since)
      }

      return (
        data?.map((row) => ({
          timestamp: new Date(row.timestamp),
          cpu: row.metadata.cpu,
          memory: row.metadata.memory,
          disk: row.metadata.disk,
          network: row.metadata.network,
          process: row.metadata.process,
        })) || []
      )
    } catch (error) {
      console.error("Error getting metrics history:", error)
      return []
    }
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter((alert) => !alert.resolved)
  }

  async getSystemHealth(): Promise<{
    status: "healthy" | "warning" | "critical"
    score: number
    issues: string[]
    uptime: number
  }> {
    try {
      const metrics = await this.getLatestMetrics()
      const activeAlerts = await this.getActiveAlerts()

      if (!metrics) {
        return {
          status: "critical",
          score: 0,
          issues: ["No metrics available"],
          uptime: process.uptime(),
        }
      }

      const issues: string[] = []
      let score = 100

      // Check CPU
      if (metrics.cpu.usage > 90) {
        issues.push("Critical CPU usage")
        score -= 30
      } else if (metrics.cpu.usage > 80) {
        issues.push("High CPU usage")
        score -= 15
      }

      // Check Memory
      if (metrics.memory.usage > 95) {
        issues.push("Critical memory usage")
        score -= 30
      } else if (metrics.memory.usage > 85) {
        issues.push("High memory usage")
        score -= 15
      }

      // Check Disk
      if (metrics.disk.usage > 95) {
        issues.push("Critical disk usage")
        score -= 25
      } else if (metrics.disk.usage > 90) {
        issues.push("High disk usage")
        score -= 10
      }

      // Check Redis connectivity
      const redisHealthy = await redisService.ping()
      if (!redisHealthy) {
        issues.push("Redis connection failed")
        score -= 20
      }

      // Factor in active alerts
      const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical").length
      const highAlerts = activeAlerts.filter((a) => a.severity === "high").length

      score -= criticalAlerts * 20
      score -= highAlerts * 10

      score = Math.max(0, score)

      let status: "healthy" | "warning" | "critical"
      if (score >= 80) status = "healthy"
      else if (score >= 60) status = "warning"
      else status = "critical"

      return {
        status,
        score,
        issues,
        uptime: process.uptime(),
      }
    } catch (error) {
      console.error("Error getting system health:", error)
      return {
        status: "critical",
        score: 0,
        issues: ["Health check failed"],
        uptime: process.uptime(),
      }
    }
  }

  // Alert rule management
  addAlertRule(rule: AlertRule) {
    this.alertRules.push(rule)
  }

  removeAlertRule(ruleId: string) {
    this.alertRules = this.alertRules.filter((rule) => rule.id !== ruleId)
    this.alerts.delete(ruleId)
  }

  updateAlertRule(ruleId: string, updates: Partial<AlertRule>) {
    const ruleIndex = this.alertRules.findIndex((rule) => rule.id === ruleId)
    if (ruleIndex !== -1) {
      this.alertRules[ruleIndex] = { ...this.alertRules[ruleIndex], ...updates }
    }
  }

  getAlertRules(): AlertRule[] {
    return [...this.alertRules]
  }
}

export const systemMonitor = new SystemMonitor()

// Auto-start monitoring in production
if (process.env.NODE_ENV === "production") {
  systemMonitor.startMonitoring(60000) // 1 minute intervals
}

// Graceful shutdown
process.on("SIGTERM", () => {
  systemMonitor.stopMonitoring()
})

process.on("SIGINT", () => {
  systemMonitor.stopMonitoring()
})
