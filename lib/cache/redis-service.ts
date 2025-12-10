import Redis from "ioredis"

class RedisService {
  private client: Redis
  private subscriber: Redis
  private publisher: Redis
  private isConnected = false

  constructor() {
    const redisConfig = {
      host: process.env.REDIS_HOST || "localhost",
      port: Number.parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      db: Number.parseInt(process.env.REDIS_DB || "0"),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      connectTimeout: 10000,
      commandTimeout: 5000,
    }

    this.client = new Redis(redisConfig)
    this.subscriber = new Redis(redisConfig)
    this.publisher = new Redis(redisConfig)

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.client.on("connect", () => {
      console.log("Redis client connected")
      this.isConnected = true
    })

    this.client.on("error", (error) => {
      console.error("Redis client error:", error)
      this.isConnected = false
    })

    this.client.on("close", () => {
      console.log("Redis client disconnected")
      this.isConnected = false
    })

    this.subscriber.on("error", (error) => {
      console.error("Redis subscriber error:", error)
    })

    this.publisher.on("error", (error) => {
      console.error("Redis publisher error:", error)
    })
  }

  async connect() {
    try {
      await Promise.all([this.client.connect(), this.subscriber.connect(), this.publisher.connect()])
      console.log("All Redis connections established")
    } catch (error) {
      console.error("Failed to connect to Redis:", error)
      throw error
    }
  }

  async disconnect() {
    try {
      await Promise.all([this.client.disconnect(), this.subscriber.disconnect(), this.publisher.disconnect()])
      console.log("All Redis connections closed")
    } catch (error) {
      console.error("Error disconnecting from Redis:", error)
    }
  }

  // Operaciones básicas de cache
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serializedValue = JSON.stringify(value)

      if (ttl) {
        await this.client.setex(key, ttl, serializedValue)
      } else {
        await this.client.set(key, serializedValue)
      }

      return true
    } catch (error) {
      console.error("Error setting cache:", error)
      return false
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key)

      if (!value) return null

      return JSON.parse(value) as T
    } catch (error) {
      console.error("Error getting cache:", error)
      return null
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key)
      return result > 0
    } catch (error) {
      console.error("Error deleting cache:", error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      console.error("Error checking cache existence:", error)
      return false
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttl)
      return result === 1
    } catch (error) {
      console.error("Error setting expiration:", error)
      return false
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key)
    } catch (error) {
      console.error("Error getting TTL:", error)
      return -1
    }
  }

  // Operaciones de lista
  async lpush(key: string, ...values: any[]): Promise<number> {
    try {
      const serializedValues = values.map((v) => JSON.stringify(v))
      return await this.client.lpush(key, ...serializedValues)
    } catch (error) {
      console.error("Error pushing to list:", error)
      return 0
    }
  }

  async rpush(key: string, ...values: any[]): Promise<number> {
    try {
      const serializedValues = values.map((v) => JSON.stringify(v))
      return await this.client.rpush(key, ...serializedValues)
    } catch (error) {
      console.error("Error pushing to list:", error)
      return 0
    }
  }

  async lpop<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.lpop(key)
      return value ? (JSON.parse(value) as T) : null
    } catch (error) {
      console.error("Error popping from list:", error)
      return null
    }
  }

  async rpop<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.rpop(key)
      return value ? (JSON.parse(value) as T) : null
    } catch (error) {
      console.error("Error popping from list:", error)
      return null
    }
  }

  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await this.client.lrange(key, start, stop)
      return values.map((v) => JSON.parse(v) as T)
    } catch (error) {
      console.error("Error getting list range:", error)
      return []
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.client.llen(key)
    } catch (error) {
      console.error("Error getting list length:", error)
      return 0
    }
  }

  // Operaciones de conjunto (sets)
  async sadd(key: string, ...members: any[]): Promise<number> {
    try {
      const serializedMembers = members.map((m) => JSON.stringify(m))
      return await this.client.sadd(key, ...serializedMembers)
    } catch (error) {
      console.error("Error adding to set:", error)
      return 0
    }
  }

  async srem(key: string, ...members: any[]): Promise<number> {
    try {
      const serializedMembers = members.map((m) => JSON.stringify(m))
      return await this.client.srem(key, ...serializedMembers)
    } catch (error) {
      console.error("Error removing from set:", error)
      return 0
    }
  }

  async smembers<T>(key: string): Promise<T[]> {
    try {
      const members = await this.client.smembers(key)
      return members.map((m) => JSON.parse(m) as T)
    } catch (error) {
      console.error("Error getting set members:", error)
      return []
    }
  }

  async sismember(key: string, member: any): Promise<boolean> {
    try {
      const result = await this.client.sismember(key, JSON.stringify(member))
      return result === 1
    } catch (error) {
      console.error("Error checking set membership:", error)
      return false
    }
  }

  async scard(key: string): Promise<number> {
    try {
      return await this.client.scard(key)
    } catch (error) {
      console.error("Error getting set cardinality:", error)
      return 0
    }
  }

  // Operaciones de hash
  async hset(key: string, field: string, value: any): Promise<boolean> {
    try {
      const result = await this.client.hset(key, field, JSON.stringify(value))
      return result >= 0
    } catch (error) {
      console.error("Error setting hash field:", error)
      return false
    }
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.client.hget(key, field)
      return value ? (JSON.parse(value) as T) : null
    } catch (error) {
      console.error("Error getting hash field:", error)
      return null
    }
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    try {
      const hash = await this.client.hgetall(key)
      const result: Record<string, T> = {}

      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value) as T
      }

      return result
    } catch (error) {
      console.error("Error getting hash:", error)
      return {}
    }
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    try {
      return await this.client.hdel(key, ...fields)
    } catch (error) {
      console.error("Error deleting hash fields:", error)
      return 0
    }
  }

  async hexists(key: string, field: string): Promise<boolean> {
    try {
      const result = await this.client.hexists(key, field)
      return result === 1
    } catch (error) {
      console.error("Error checking hash field existence:", error)
      return false
    }
  }

  // Operaciones de sorted sets (leaderboards)
  async zadd(key: string, score: number, member: any): Promise<number> {
    try {
      return await this.client.zadd(key, score, JSON.stringify(member))
    } catch (error) {
      console.error("Error adding to sorted set:", error)
      return 0
    }
  }

  async zrange<T>(
    key: string,
    start: number,
    stop: number,
    withScores = false,
  ): Promise<T[] | Array<{ member: T; score: number }>> {
    try {
      if (withScores) {
        const result = await this.client.zrange(key, start, stop, "WITHSCORES")
        const pairs: Array<{ member: T; score: number }> = []

        for (let i = 0; i < result.length; i += 2) {
          pairs.push({
            member: JSON.parse(result[i]) as T,
            score: Number.parseFloat(result[i + 1]),
          })
        }

        return pairs
      } else {
        const members = await this.client.zrange(key, start, stop)
        return members.map((m) => JSON.parse(m) as T)
      }
    } catch (error) {
      console.error("Error getting sorted set range:", error)
      return []
    }
  }

  async zrevrange<T>(
    key: string,
    start: number,
    stop: number,
    withScores = false,
  ): Promise<T[] | Array<{ member: T; score: number }>> {
    try {
      if (withScores) {
        const result = await this.client.zrevrange(key, start, stop, "WITHSCORES")
        const pairs: Array<{ member: T; score: number }> = []

        for (let i = 0; i < result.length; i += 2) {
          pairs.push({
            member: JSON.parse(result[i]) as T,
            score: Number.parseFloat(result[i + 1]),
          })
        }

        return pairs
      } else {
        const members = await this.client.zrevrange(key, start, stop)
        return members.map((m) => JSON.parse(m) as T)
      }
    } catch (error) {
      console.error("Error getting reverse sorted set range:", error)
      return []
    }
  }

  async zscore(key: string, member: any): Promise<number | null> {
    try {
      const score = await this.client.zscore(key, JSON.stringify(member))
      return score !== null ? Number.parseFloat(score) : null
    } catch (error) {
      console.error("Error getting sorted set score:", error)
      return null
    }
  }

  async zrank(key: string, member: any): Promise<number | null> {
    try {
      return await this.client.zrank(key, JSON.stringify(member))
    } catch (error) {
      console.error("Error getting sorted set rank:", error)
      return null
    }
  }

  async zrem(key: string, ...members: any[]): Promise<number> {
    try {
      const serializedMembers = members.map((m) => JSON.stringify(m))
      return await this.client.zrem(key, ...serializedMembers)
    } catch (error) {
      console.error("Error removing from sorted set:", error)
      return 0
    }
  }

  // Pub/Sub operations
  async publish(channel: string, message: any): Promise<number> {
    try {
      return await this.publisher.publish(channel, JSON.stringify(message))
    } catch (error) {
      console.error("Error publishing message:", error)
      return 0
    }
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    try {
      await this.subscriber.subscribe(channel)

      this.subscriber.on("message", (receivedChannel, message) => {
        if (receivedChannel === channel) {
          try {
            const parsedMessage = JSON.parse(message)
            callback(parsedMessage)
          } catch (error) {
            console.error("Error parsing subscribed message:", error)
          }
        }
      })
    } catch (error) {
      console.error("Error subscribing to channel:", error)
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel)
    } catch (error) {
      console.error("Error unsubscribing from channel:", error)
    }
  }

  // Rate limiting
  async rateLimit(
    key: string,
    limit: number,
    window: number,
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const current = await this.client.incr(key)

      if (current === 1) {
        await this.client.expire(key, window)
      }

      const ttl = await this.client.ttl(key)
      const resetTime = Date.now() + ttl * 1000

      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetTime,
      }
    } catch (error) {
      console.error("Error in rate limiting:", error)
      return { allowed: false, remaining: 0, resetTime: Date.now() }
    }
  }

  // Distributed locks
  async acquireLock(key: string, ttl = 10): Promise<string | null> {
    try {
      const lockKey = `lock:${key}`
      const lockValue = `${Date.now()}-${Math.random()}`

      const result = await this.client.set(lockKey, lockValue, "EX", ttl, "NX")

      return result === "OK" ? lockValue : null
    } catch (error) {
      console.error("Error acquiring lock:", error)
      return null
    }
  }

  async releaseLock(key: string, lockValue: string): Promise<boolean> {
    try {
      const lockKey = `lock:${key}`

      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `

      const result = await this.client.eval(script, 1, lockKey, lockValue)
      return result === 1
    } catch (error) {
      console.error("Error releasing lock:", error)
      return false
    }
  }

  // Cache patterns
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T | null> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key)
      if (cached !== null) {
        return cached
      }

      // If not in cache, fetch and store
      const data = await fetcher()
      await this.set(key, data, ttl)

      return data
    } catch (error) {
      console.error("Error in getOrSet:", error)
      return null
    }
  }

  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern)

      if (keys.length === 0) return 0

      return await this.client.del(...keys)
    } catch (error) {
      console.error("Error invalidating pattern:", error)
      return 0
    }
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping()
      return result === "PONG"
    } catch (error) {
      console.error("Redis ping failed:", error)
      return false
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  // Get Redis info
  async getInfo(): Promise<any> {
    try {
      const info = await this.client.info()
      return this.parseRedisInfo(info)
    } catch (error) {
      console.error("Error getting Redis info:", error)
      return null
    }
  }

  private parseRedisInfo(info: string): any {
    const lines = info.split("\r\n")
    const result: any = {}
    let currentSection = ""

    for (const line of lines) {
      if (line.startsWith("#")) {
        currentSection = line.substring(2).toLowerCase()
        result[currentSection] = {}
      } else if (line.includes(":")) {
        const [key, value] = line.split(":")
        if (currentSection) {
          result[currentSection][key] = isNaN(Number(value)) ? value : Number(value)
        }
      }
    }

    return result
  }

  // Memory usage
  async getMemoryUsage(): Promise<{ used: number; peak: number; total: number }> {
    try {
      const info = await this.getInfo()
      return {
        used: info.memory?.used_memory || 0,
        peak: info.memory?.used_memory_peak || 0,
        total: info.memory?.total_system_memory || 0,
      }
    } catch (error) {
      console.error("Error getting memory usage:", error)
      return { used: 0, peak: 0, total: 0 }
    }
  }

  // Key count
  async getKeyCount(): Promise<number> {
    try {
      const info = await this.getInfo()
      return info.keyspace?.db0?.keys || 0
    } catch (error) {
      console.error("Error getting key count:", error)
      return 0
    }
  }
}

export const redisService = new RedisService()

// Initialize Redis connection
if (process.env.NODE_ENV !== "test") {
  redisService.connect().catch(console.error)
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  await redisService.disconnect()
})

process.on("SIGINT", async () => {
  await redisService.disconnect()
})
