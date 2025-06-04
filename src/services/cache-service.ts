import type { ICacheService } from "../interfaces/weather-interfaces"

interface CacheEntry<T> {
  value: T
  expiry: number
  size: number
}

export class MemoryCacheService<T> implements ICacheService<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private readonly maxSize: number
  private readonly defaultTtl: number
  private currentSize = 0

  constructor(maxSize = 100, defaultTtl = 300000) {
    this.maxSize = maxSize
    this.defaultTtl = defaultTtl
  }

  public get(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiry) {
      this.delete(key)
      return null
    }

    return entry.value
  }

  public set(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTtl)
    const size = this.calculateSize(value)

    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      this.delete(key)
    }

    // Ensure we have space
    this.ensureSpace(size)

    this.cache.set(key, { value, expiry, size })
    this.currentSize += size
  }

  public delete(key: string): void {
    const entry = this.cache.get(key)
    if (entry) {
      this.cache.delete(key)
      this.currentSize -= entry.size
    }
  }

  public clear(): void {
    this.cache.clear()
    this.currentSize = 0
  }

  public size(): number {
    return this.cache.size
  }

  public getMemoryUsage(): number {
    return this.currentSize
  }

  private calculateSize(value: T): number {
    try {
      return JSON.stringify(value).length
    } catch {
      return 1 // Fallback for non-serializable objects
    }
  }

  private ensureSpace(requiredSize: number): void {
    while (this.currentSize + requiredSize > this.maxSize && this.cache.size > 0) {
      this.evictOldest()
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Number.POSITIVE_INFINITY

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < oldestTime) {
        oldestTime = entry.expiry
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.delete(oldestKey)
    }
  }

  public cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach((key) => this.delete(key))
  }
}

/**
 * Persistent cache service using localStorage
 */
export class PersistentCacheService<T> implements ICacheService<T> {
  private readonly prefix: string
  private readonly maxSize: number
  private readonly defaultTtl: number

  constructor(prefix = "weather_cache_", maxSize = 50, defaultTtl = 3600000) {
    this.prefix = prefix
    this.maxSize = maxSize
    this.defaultTtl = defaultTtl
  }

  public get(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key)
      if (!item) return null

      const parsed = JSON.parse(item)
      if (Date.now() > parsed.expiry) {
        this.delete(key)
        return null
      }

      return parsed.value
    } catch {
      return null
    }
  }

  public set(key: string, value: T, ttl?: number): void {
    try {
      const expiry = Date.now() + (ttl || this.defaultTtl)
      const item = { value, expiry }

      this.ensureSpace()
      localStorage.setItem(this.prefix + key, JSON.stringify(item))
    } catch (error) {
      console.warn("Failed to cache item:", error)
    }
  }

  public delete(key: string): void {
    localStorage.removeItem(this.prefix + key)
  }

  public clear(): void {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith(this.prefix))
    keys.forEach((key) => localStorage.removeItem(key))
  }

  public size(): number {
    return Object.keys(localStorage).filter((key) => key.startsWith(this.prefix)).length
  }

  private ensureSpace(): void {
    while (this.size() >= this.maxSize) {
      this.evictOldest()
    }
  }

  private evictOldest(): void {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith(this.prefix))
    let oldestKey: string | null = null
    let oldestTime = Number.POSITIVE_INFINITY

    for (const key of keys) {
      try {
        const item = JSON.parse(localStorage.getItem(key) || "{}")
        if (item.expiry < oldestTime) {
          oldestTime = item.expiry
          oldestKey = key
        }
      } catch {
        // Invalid item, remove it
        localStorage.removeItem(key)
      }
    }

    if (oldestKey) {
      localStorage.removeItem(oldestKey)
    }
  }
}
