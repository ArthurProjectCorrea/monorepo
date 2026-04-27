import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export type CacheHandlerOptions = Record<string, unknown>

export interface CacheContext {
  tags?: string[]
}

export interface CacheData {
  value?: unknown
  lastModified?: number
  revalidate?: number
  [key: string]: unknown
}

export default class CacheHandler {
  options: CacheHandlerOptions

  constructor(options: CacheHandlerOptions) {
    this.options = options
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key)
      if (!data) return null

      const parsed = JSON.parse(data) as T

      // Next.js cache entries must have a value property. If not, it might be corrupted.
      if (!parsed || typeof parsed !== 'object' || !('value' in parsed)) {
        return null
      }

      return parsed
    } catch (error) {
      console.error('Redis Cache Get Error:', error)
      return null
    }
  }

  async set(key: string, data: CacheData, ctx?: CacheContext): Promise<void> {
    try {
      const ttl = data.revalidate || 3600
      await redis.set(key, JSON.stringify(data), 'EX', ttl)

      if (ctx?.tags) {
        for (const tag of ctx.tags) {
          await redis.sadd(`tag:${tag}`, key)
        }
      }
    } catch (error) {
      console.error('Redis Cache Set Error:', error)
    }
  }

  async revalidateTag(tag: string): Promise<void> {
    try {
      const keys = await redis.smembers(`tag:${tag}`)
      if (keys.length > 0) {
        await redis.del(...keys)
        await redis.del(`tag:${tag}`)
      }
    } catch (error) {
      console.error('Redis Cache Revalidate Error:', error)
    }
  }
}
