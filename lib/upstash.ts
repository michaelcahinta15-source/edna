import { Redis } from '@upstash/redis';

// Types for our cache
interface CacheOptions {
  ttl?: number; // TTL in seconds, default 1 hour
}

export class UpstashService {
  private redis: Redis | null;
  private useUpstash: boolean;
  private fallbackCache: Map<string, { value: any; expiry: number }>;

  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    // Initialize fallbackCache in constructor
    this.fallbackCache = new Map();

    if (url && token) {
      try {
        this.redis = new Redis({ url, token });
        this.useUpstash = true;
        console.log('Upstash Redis connected');
      } catch (error) {
        console.error('Failed to initialize Upstash Redis, falling back to in-memory cache:', error);
        this.redis = null;
        this.useUpstash = false;
        // fallbackCache is already initialized above
      }
    } else {
      this.useUpstash = false;
      this.redis = null;
      console.log('Upstash credentials not provided, using in-memory cache');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.useUpstash && this.redis) {
      try {
        const value = await this.redis.get<T>(key);
        return value ?? null;
      } catch (error) {
        console.error('Upstash get error, falling back to in-memory:', error);
        // Fall back to in-memory for this operation
        return this.getFromFallback<T>(key);
      }
    } else {
      return this.getFromFallback<T>(key);
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl ?? 3600; // Default 1 hour

    if (this.useUpstash && this.redis) {
      try {
        await this.redis.set(key, value, { ex: ttl });
        return;
      } catch (error) {
        console.error('Upstash set error, falling back to in-memory:', error);
        // Fall back to in-memory for this operation
        return this.setToFallback(key, value, ttl);
      }
    } else {
      return this.setToFallback(key, value, ttl);
    }
  }

  async delete(key: string): Promise<void> {
    if (this.useUpstash && this.redis) {
      try {
        // @upstash/redis uses `del` for deleting keys
        await this.redis.del(key);
        return;
      } catch (error) {
        console.error('Upstash delete error, falling back to in-memory:', error);
        // Fall back to in-memory for this operation
        return this.deleteFromFallback(key);
      }
    } else {
      return this.deleteFromFallback(key);
    }
  }

  // Fallback methods using in-memory Map
  private getFromFallback<T>(key: string): T | null {
    const item = this.fallbackCache.get(key);
    if (!item) {
      return null;
    }

    const now = Date.now();
    if (item.expiry < now) {
      // Expired, remove it
      this.fallbackCache.delete(key);
      return null;
    }

    return item.value as T;
  }

  private setToFallback<T>(key: string, value: T, ttlSeconds: number): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.fallbackCache.set(key, { value, expiry });

    // Optional: cleanup expired entries periodically (we'll do it on every set for simplicity)
    this.cleanupFallback();
  }

  private deleteFromFallback(key: string): void {
    this.fallbackCache.delete(key);
  }

  private cleanupFallback(): void {
    const now = Date.now();
    for (const [key, item] of this.fallbackCache.entries()) {
      if (item.expiry < now) {
        this.fallbackCache.delete(key);
      }
    }
  }
}

// Export a singleton instance
export const upstashService = new UpstashService();