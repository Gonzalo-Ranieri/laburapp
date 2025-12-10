import { supabaseAdmin } from "../supabase/client"
import { createWriteStream, createReadStream } from "fs"
import { pipeline } from "stream/promises"
import { createGzip } from "zlib"
import { join } from "path"
import { mkdir, readdir, stat, unlink } from "fs/promises"

export interface BackupConfig {
  enabled: boolean
  schedule: string // cron expression
  retention: {
    daily: number // days
    weekly: number // weeks
    monthly: number // months
  }
  compression: boolean
  encryption: boolean
  storage: {
    local: {
      enabled: boolean
      path: string
    }
    s3: {
      enabled: boolean
      bucket: string
      region: string
      accessKeyId: string
      secretAccessKey: string
    }
    gcs: {
      enabled: boolean
      bucket: string
      keyFilename: string
    }
  }
  tables: {
    include: string[]
    exclude: string[]
  }
  notifications: {
    onSuccess: boolean
    onFailure: boolean
    channels: string[]
  }
}

export interface BackupMetadata {
  id: string
  type: "full" | "incremental" | "differential"
  status: "pending" | "running" | "completed" | "failed"
  startTime: Date
  endTime?: Date
  duration?: number
  size?: number
  tables: string[]
  recordCount: number
  checksum: string
  location: string
  error?: string
  createdBy: "system" | "manual"
}

export interface RestoreOptions {
  backupId: string
  tables?: string[]
  targetDatabase?: string
  overwrite: boolean
  validateData: boolean
  dryRun: boolean
}

class BackupService {
  private config: BackupConfig
  private isRunning = false
  private currentBackup?: BackupMetadata

  constructor() {
    this.config = this.loadConfig()
  }

  private loadConfig(): BackupConfig {
    return {
      enabled: process.env.BACKUP_ENABLED === "true",
      schedule: process.env.BACKUP_SCHEDULE || "0 2 * * *", // Daily at 2 AM
      retention: {
        daily: Number.parseInt(process.env.BACKUP_RETENTION_DAILY || "7"),
        weekly: Number.parseInt(process.env.BACKUP_RETENTION_WEEKLY || "4"),
        monthly: Number.parseInt(process.env.BACKUP_RETENTION_MONTHLY || "12"),
      },
      compression: process.env.BACKUP_COMPRESSION === "true",
      encryption: process.env.BACKUP_ENCRYPTION === "true",
      storage: {
        local: {
          enabled: process.env.BACKUP_LOCAL_ENABLED === "true",
          path: process.env.BACKUP_LOCAL_PATH || "./backups",
        },
        s3: {
          enabled: process.env.BACKUP_S3_ENABLED === "true",
          bucket: process.env.BACKUP_S3_BUCKET || "",
          region: process.env.BACKUP_S3_REGION || "",
          accessKeyId: process.env.BACKUP_S3_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.BACKUP_S3_SECRET_ACCESS_KEY || "",
        },
        gcs: {
          enabled: process.env.BACKUP_GCS_ENABLED === "true",
          bucket: process.env.BACKUP_GCS_BUCKET || "",
          keyFilename: process.env.BACKUP_GCS_KEY_FILENAME || "",
        },
      },
      tables: {
        include: (process.env.BACKUP_INCLUDE_TABLES || "").split(",").filter(Boolean),
        exclude: (process.env.BACKUP_EXCLUDE_TABLES || "").split(",").filter(Boolean),
      },
      notifications: {
        onSuccess: process.env.BACKUP_NOTIFY_SUCCESS === "true",
        onFailure: process.env.BACKUP_NOTIFY_FAILURE === "true",
        channels: (process.env.BACKUP_NOTIFY_CHANNELS || "email").split(","),
      },
    }
  }

  // Crear backup completo
  async createFullBackup(manual = false): Promise<BackupMetadata | null> {
    if (this.isRunning) {
      console.log("Backup already running")
      return null
    }

    this.isRunning = true
    const startTime = new Date()
    const backupId = `backup_${startTime.getTime()}_${Math.random().toString(36).substr(2, 9)}`

    const metadata: BackupMetadata = {
      id: backupId,
      type: "full",
      status: "pending",
      startTime,
      tables: [],
      recordCount: 0,
      checksum: "",
      location: "",
      createdBy: manual ? "manual" : "system",
    }

    try {
      console.log(`Starting full backup: ${backupId}`)
      metadata.status = "running"
      this.currentBackup = metadata

      // Obtener lista de tablas
      const tables = await this.getTablesToBackup()
      metadata.tables = tables

      // Crear directorio de backup
      const backupDir = await this.createBackupDirectory(backupId)
      metadata.location = backupDir

      let totalRecords = 0
      const backupData: Record<string, any[]> = {}

      // Hacer backup de cada tabla
      for (const table of tables) {
        console.log(`Backing up table: ${table}`)

        const tableData = await this.backupTable(table)
        if (tableData) {
          backupData[table] = tableData.data
          totalRecords += tableData.count
        }
      }

      metadata.recordCount = totalRecords

      // Guardar datos del backup
      const backupFile = join(backupDir, "data.json")
      await this.saveBackupData(backupData, backupFile)

      // Calcular checksum
      metadata.checksum = await this.calculateChecksum(backupFile)

      // Comprimir si está habilitado
      if (this.config.compression) {
        await this.compressBackup(backupFile)
      }

      // Encriptar si está habilitado
      if (this.config.encryption) {
        await this.encryptBackup(backupFile)
      }

      // Obtener tamaño final
      const stats = await stat(backupFile)
      metadata.size = stats.size

      // Subir a almacenamiento remoto
      await this.uploadBackup(metadata)

      // Finalizar backup
      metadata.status = "completed"
      metadata.endTime = new Date()
      metadata.duration = metadata.endTime.getTime() - metadata.startTime.getTime()

      // Guardar metadata en base de datos
      await this.saveBackupMetadata(metadata)

      // Notificar éxito
      if (this.config.notifications.onSuccess) {
        await this.notifyBackupResult(metadata, true)
      }

      console.log(`Backup completed: ${backupId} (${metadata.duration}ms, ${metadata.recordCount} records)`)
      return metadata
    } catch (error) {
      console.error(`Backup failed: ${backupId}`, error)

      metadata.status = "failed"
      metadata.endTime = new Date()
      metadata.error = error instanceof Error ? error.message : "Unknown error"

      await this.saveBackupMetadata(metadata)

      if (this.config.notifications.onFailure) {
        await this.notifyBackupResult(metadata, false)
      }

      return metadata
    } finally {
      this.isRunning = false
      this.currentBackup = undefined
    }
  }

  // Crear backup incremental
  async createIncrementalBackup(lastBackupId: string): Promise<BackupMetadata | null> {
    if (this.isRunning) {
      console.log("Backup already running")
      return null
    }

    try {
      // Obtener metadata del último backup
      const lastBackup = await this.getBackupMetadata(lastBackupId)
      if (!lastBackup) {
        throw new Error("Last backup not found")
      }

      const startTime = new Date()
      const backupId = `incremental_${startTime.getTime()}_${Math.random().toString(36).substr(2, 9)}`

      const metadata: BackupMetadata = {
        id: backupId,
        type: "incremental",
        status: "running",
        startTime,
        tables: [],
        recordCount: 0,
        checksum: "",
        location: "",
        createdBy: "system",
      }

      console.log(`Starting incremental backup: ${backupId} (since ${lastBackupId})`)

      // Obtener cambios desde el último backup
      const tables = await this.getTablesToBackup()
      const changes = await this.getChangedRecords(tables, lastBackup.startTime)

      metadata.tables = Object.keys(changes)
      metadata.recordCount = Object.values(changes).reduce((sum, records) => sum + records.length, 0)

      // Crear directorio y guardar cambios
      const backupDir = await this.createBackupDirectory(backupId)
      metadata.location = backupDir

      const backupFile = join(backupDir, "incremental.json")
      await this.saveBackupData(
        {
          baseBackupId: lastBackupId,
          timestamp: startTime.toISOString(),
          changes,
        },
        backupFile,
      )

      // Finalizar backup incremental
      metadata.status = "completed"
      metadata.endTime = new Date()
      metadata.duration = metadata.endTime.getTime() - metadata.startTime.getTime()
      metadata.checksum = await this.calculateChecksum(backupFile)

      const stats = await stat(backupFile)
      metadata.size = stats.size

      await this.saveBackupMetadata(metadata)

      console.log(`Incremental backup completed: ${backupId} (${metadata.recordCount} changed records)`)
      return metadata
    } catch (error) {
      console.error("Incremental backup failed:", error)
      return null
    }
  }

  // Restaurar backup
  async restoreBackup(options: RestoreOptions): Promise<boolean> {
    try {
      console.log(`Starting restore from backup: ${options.backupId}`)

      if (options.dryRun) {
        console.log("DRY RUN: No actual changes will be made")
      }

      // Obtener metadata del backup
      const backup = await this.getBackupMetadata(options.backupId)
      if (!backup) {
        throw new Error("Backup not found")
      }

      // Cargar datos del backup
      const backupData = await this.loadBackupData(backup)
      if (!backupData) {
        throw new Error("Failed to load backup data")
      }

      // Validar datos si está habilitado
      if (options.validateData) {
        const isValid = await this.validateBackupData(backupData, backup)
        if (!isValid) {
          throw new Error("Backup data validation failed")
        }
      }

      // Determinar tablas a restaurar
      const tablesToRestore = options.tables || backup.tables

      if (!options.dryRun) {
        // Crear transacción para restauración
        for (const table of tablesToRestore) {
          if (backupData[table]) {
            console.log(`Restoring table: ${table} (${backupData[table].length} records)`)

            if (options.overwrite) {
              // Limpiar tabla existente
              await supabaseAdmin.from(table).delete().neq("id", "")
            }

            // Insertar datos en lotes
            await this.insertDataInBatches(table, backupData[table])
          }
        }
      }

      console.log(`Restore completed from backup: ${options.backupId}`)
      return true
    } catch (error) {
      console.error("Restore failed:", error)
      return false
    }
  }

  // Obtener lista de backups
  async listBackups(limit = 50, offset = 0): Promise<BackupMetadata[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("backup_metadata")
        .select("*")
        .order("start_time", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error("Error listing backups:", error)
        return []
      }

      return (
        data?.map((row) => ({
          id: row.id,
          type: row.type,
          status: row.status,
          startTime: new Date(row.start_time),
          endTime: row.end_time ? new Date(row.end_time) : undefined,
          duration: row.duration,
          size: row.size,
          tables: row.tables,
          recordCount: row.record_count,
          checksum: row.checksum,
          location: row.location,
          error: row.error,
          createdBy: row.created_by,
        })) || []
      )
    } catch (error) {
      console.error("Error listing backups:", error)
      return []
    }
  }

  // Eliminar backup
  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const backup = await this.getBackupMetadata(backupId)
      if (!backup) {
        console.log(`Backup ${backupId} not found`)
        return false
      }

      // Eliminar archivos físicos
      await this.deleteBackupFiles(backup.location)

      // Eliminar metadata de la base de datos
      const { error } = await supabaseAdmin.from("backup_metadata").delete().eq("id", backupId)

      if (error) {
        console.error("Error deleting backup metadata:", error)
        return false
      }

      console.log(`Backup deleted: ${backupId}`)
      return true
    } catch (error) {
      console.error("Error deleting backup:", error)
      return false
    }
  }

  // Limpiar backups antiguos según política de retención
  async cleanupOldBackups(): Promise<number> {
    try {
      const now = new Date()
      let deletedCount = 0

      // Limpiar backups diarios antiguos
      const dailyCutoff = new Date(now.getTime() - this.config.retention.daily * 24 * 60 * 60 * 1000)
      const oldDailyBackups = await this.getBackupsOlderThan(dailyCutoff, "full")

      for (const backup of oldDailyBackups) {
        if (await this.deleteBackup(backup.id)) {
          deletedCount++
        }
      }

      console.log(`Cleaned up ${deletedCount} old backups`)
      return deletedCount
    } catch (error) {
      console.error("Error cleaning up old backups:", error)
      return 0
    }
  }

  // Verificar integridad de backup
  async verifyBackupIntegrity(backupId: string): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const backup = await this.getBackupMetadata(backupId)
      if (!backup) {
        return { valid: false, errors: ["Backup not found"] }
      }

      const errors: string[] = []

      // Verificar que los archivos existen
      const backupFile = join(backup.location, "data.json")
      try {
        await stat(backupFile)
      } catch {
        errors.push("Backup file not found")
      }

      // Verificar checksum
      const currentChecksum = await this.calculateChecksum(backupFile)
      if (currentChecksum !== backup.checksum) {
        errors.push("Checksum mismatch")
      }

      // Cargar y validar datos
      try {
        const data = await this.loadBackupData(backup)
        if (!data) {
          errors.push("Failed to load backup data")
        } else {
          // Verificar estructura de datos
          for (const table of backup.tables) {
            if (!data[table]) {
              errors.push(`Missing data for table: ${table}`)
            }
          }
        }
      } catch (error) {
        errors.push(`Data validation error: ${error instanceof Error ? error.message : "Unknown error"}`)
      }

      return { valid: errors.length === 0, errors }
    } catch (error) {
      console.error("Error verifying backup integrity:", error)
      return { valid: false, errors: ["Verification failed"] }
    }
  }

  // Obtener estadísticas de backups
  async getBackupStatistics(): Promise<{
    total: number
    successful: number
    failed: number
    totalSize: number
    averageDuration: number
    lastBackup?: BackupMetadata
  }> {
    try {
      const { data, error } = await supabaseAdmin
        .from("backup_metadata")
        .select("status, size, duration, start_time")
        .order("start_time", { ascending: false })

      if (error) {
        console.error("Error getting backup statistics:", error)
        return {
          total: 0,
          successful: 0,
          failed: 0,
          totalSize: 0,
          averageDuration: 0,
        }
      }

      const backups = data || []
      const successful = backups.filter((b) => b.status === "completed")
      const failed = backups.filter((b) => b.status === "failed")
      const totalSize = successful.reduce((sum, b) => sum + (b.size || 0), 0)
      const averageDuration =
        successful.length > 0 ? successful.reduce((sum, b) => sum + (b.duration || 0), 0) / successful.length : 0

      const lastBackup = backups.length > 0 ? await this.getBackupMetadata(backups[0].id) : undefined

      return {
        total: backups.length,
        successful: successful.length,
        failed: failed.length,
        totalSize,
        averageDuration,
        lastBackup: lastBackup || undefined,
      }
    } catch (error) {
      console.error("Error getting backup statistics:", error)
      return {
        total: 0,
        successful: 0,
        failed: 0,
        totalSize: 0,
        averageDuration: 0,
      }
    }
  }

  // Métodos auxiliares privados
  private async getTablesToBackup(): Promise<string[]> {
    try {
      // Obtener todas las tablas de la base de datos
      const { data, error } = await supabaseAdmin
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .neq("table_name", "backup_metadata")

      if (error) {
        console.error("Error getting tables:", error)
        return []
      }

      let tables = data?.map((row) => row.table_name) || []

      // Aplicar filtros de inclusión/exclusión
      if (this.config.tables.include.length > 0) {
        tables = tables.filter((table) => this.config.tables.include.includes(table))
      }

      if (this.config.tables.exclude.length > 0) {
        tables = tables.filter((table) => !this.config.tables.exclude.includes(table))
      }

      return tables
    } catch (error) {
      console.error("Error getting tables to backup:", error)
      return []
    }
  }

  private async backupTable(tableName: string): Promise<{ data: any[]; count: number } | null> {
    try {
      const { data, error } = await supabaseAdmin.from(tableName).select("*")

      if (error) {
        console.error(`Error backing up table ${tableName}:`, error)
        return null
      }

      return {
        data: data || [],
        count: data?.length || 0,
      }
    } catch (error) {
      console.error(`Error backing up table ${tableName}:`, error)
      return null
    }
  }

  private async createBackupDirectory(backupId: string): Promise<string> {
    const backupDir = join(this.config.storage.local.path, backupId)
    await mkdir(backupDir, { recursive: true })
    return backupDir
  }

  private async saveBackupData(data: any, filePath: string): Promise<void> {
    const writeStream = createWriteStream(filePath)
    writeStream.write(JSON.stringify(data, null, 2))
    writeStream.end()

    return new Promise((resolve, reject) => {
      writeStream.on("finish", resolve)
      writeStream.on("error", reject)
    })
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    const crypto = require("crypto")
    const hash = crypto.createHash("sha256")
    const stream = createReadStream(filePath)

    return new Promise((resolve, reject) => {
      stream.on("data", (data) => hash.update(data))
      stream.on("end", () => resolve(hash.digest("hex")))
      stream.on("error", reject)
    })
  }

  private async compressBackup(filePath: string): Promise<void> {
    const compressedPath = `${filePath}.gz`
    const readStream = createReadStream(filePath)
    const writeStream = createWriteStream(compressedPath)
    const gzip = createGzip()

    await pipeline(readStream, gzip, writeStream)

    // Eliminar archivo original
    await unlink(filePath)
  }

  private async encryptBackup(filePath: string): Promise<void> {
    // Implementar encriptación si es necesario
    console.log("Encryption not implemented yet")
  }

  private async uploadBackup(metadata: BackupMetadata): Promise<void> {
    // Implementar subida a almacenamiento remoto (S3, GCS, etc.)
    console.log("Remote upload not implemented yet")
  }

  private async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    try {
      const { error } = await supabaseAdmin.from("backup_metadata").upsert({
        id: metadata.id,
        type: metadata.type,
        status: metadata.status,
        start_time: metadata.startTime.toISOString(),
        end_time: metadata.endTime?.toISOString(),
        duration: metadata.duration,
        size: metadata.size,
        tables: metadata.tables,
        record_count: metadata.recordCount,
        checksum: metadata.checksum,
        location: metadata.location,
        error: metadata.error,
        created_by: metadata.createdBy,
      })

      if (error) {
        console.error("Error saving backup metadata:", error)
      }
    } catch (error) {
      console.error("Error saving backup metadata:", error)
    }
  }

  private async getBackupMetadata(backupId: string): Promise<BackupMetadata | null> {
    try {
      const { data, error } = await supabaseAdmin.from("backup_metadata").select("*").eq("id", backupId).single()

      if (error) {
        console.error("Error getting backup metadata:", error)
        return null
      }

      return {
        id: data.id,
        type: data.type,
        status: data.status,
        startTime: new Date(data.start_time),
        endTime: data.end_time ? new Date(data.end_time) : undefined,
        duration: data.duration,
        size: data.size,
        tables: data.tables,
        recordCount: data.record_count,
        checksum: data.checksum,
        location: data.location,
        error: data.error,
        createdBy: data.created_by,
      }
    } catch (error) {
      console.error("Error getting backup metadata:", error)
      return null
    }
  }

  private async loadBackupData(backup: BackupMetadata): Promise<any> {
    try {
      const backupFile = join(backup.location, "data.json")
      const data = await import(backupFile)
      return data
    } catch (error) {
      console.error("Error loading backup data:", error)
      return null
    }
  }

  private async validateBackupData(data: any, backup: BackupMetadata): Promise<boolean> {
    try {
      // Validar estructura básica
      if (!data || typeof data !== "object") {
        return false
      }

      // Validar que todas las tablas esperadas estén presentes
      for (const table of backup.tables) {
        if (!data[table] || !Array.isArray(data[table])) {
          return false
        }
      }

      return true
    } catch (error) {
      console.error("Error validating backup data:", error)
      return false
    }
  }

  private async insertDataInBatches(tableName: string, data: any[], batchSize = 1000): Promise<void> {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)

      const { error } = await supabaseAdmin.from(tableName).insert(batch)

      if (error) {
        console.error(`Error inserting batch for table ${tableName}:`, error)
        throw error
      }
    }
  }

  private async getChangedRecords(tables: string[], since: Date): Promise<Record<string, any[]>> {
    const changes: Record<string, any[]> = {}

    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin.from(table).select("*").gte("updated_at", since.toISOString())

        if (error) {
          console.error(`Error getting changes for table ${table}:`, error)
          continue
        }

        if (data && data.length > 0) {
          changes[table] = data
        }
      } catch (error) {
        console.error(`Error getting changes for table ${table}:`, error)
      }
    }

    return changes
  }

  private async getBackupsOlderThan(date: Date, type?: string): Promise<BackupMetadata[]> {
    try {
      let query = supabaseAdmin.from("backup_metadata").select("*").lt("start_time", date.toISOString())

      if (type) {
        query = query.eq("type", type)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error getting old backups:", error)
        return []
      }

      return (
        data?.map((row) => ({
          id: row.id,
          type: row.type,
          status: row.status,
          startTime: new Date(row.start_time),
          endTime: row.end_time ? new Date(row.end_time) : undefined,
          duration: row.duration,
          size: row.size,
          tables: row.tables,
          recordCount: row.record_count,
          checksum: row.checksum,
          location: row.location,
          error: row.error,
          createdBy: row.created_by,
        })) || []
      )
    } catch (error) {
      console.error("Error getting old backups:", error)
      return []
    }
  }

  private async deleteBackupFiles(location: string): Promise<void> {
    try {
      const files = await readdir(location)

      for (const file of files) {
        await unlink(join(location, file))
      }

      // Eliminar directorio
      await import("fs").then((fs) => fs.promises.rmdir(location))
    } catch (error) {
      console.error("Error deleting backup files:", error)
    }
  }

  private async notifyBackupResult(backup: BackupMetadata, success: boolean): Promise<void> {
    try {
      const message = success
        ? `Backup ${backup.id} completed successfully (${backup.recordCount} records, ${backup.duration}ms)`
        : `Backup ${backup.id} failed: ${backup.error}`

      // Enviar notificación a través de los canales configurados
      for (const channel of this.config.notifications.channels) {
        switch (channel) {
          case "email":
            // Implementar notificación por email
            console.log(`📧 Email notification: ${message}`)
            break
          case "slack":
            // Implementar notificación por Slack
            console.log(`💬 Slack notification: ${message}`)
            break
          case "webhook":
            // Implementar notificación por webhook
            console.log(`🔗 Webhook notification: ${message}`)
            break
        }
      }
    } catch (error) {
      console.error("Error sending backup notification:", error)
    }
  }

  // Métodos públicos para configuración
  updateConfig(newConfig: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): BackupConfig {
    return { ...this.config }
  }

  getCurrentBackup(): BackupMetadata | undefined {
    return this.currentBackup
  }

  isBackupRunning(): boolean {
    return this.isRunning
  }
}

export const backupService = new BackupService()

// Programar backups automáticos si está habilitado
if (process.env.NODE_ENV === "production" && backupService.getConfig().enabled) {
  const cron = require("node-cron")

  // Backup diario
  cron.schedule(backupService.getConfig().schedule, async () => {
    console.log("Starting scheduled backup...")
    await backupService.createFullBackup()
  })

  // Limpieza semanal de backups antiguos
  cron.schedule("0 3 * * 0", async () => {
    // Domingos a las 3 AM
    console.log("Starting backup cleanup...")
    await backupService.cleanupOldBackups()
  })
}
