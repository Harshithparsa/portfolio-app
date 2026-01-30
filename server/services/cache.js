const Redis = require('ioredis');

// Redis caching service
class CacheService {
  constructor() {
    this.redis = null;
    this.initialized = false;
  }

  // Initialize Redis connection
  async initialize() {
    try {
      if (!process.env.REDIS_URL) {
        console.log('⚠️ REDIS_URL not configured - caching disabled (optional)');
        return false;
      }

      this.redis = new Redis(process.env.REDIS_URL);

      this.redis.on('connect', () => {
        console.log('✅ Redis connected');
        this.initialized = true;
      });

      this.redis.on('error', (error) => {
        console.error('❌ Redis error:', error.message);
      });

      // Test connection
      await this.redis.ping();
      this.initialized = true;
      return true;

    } catch (error) {
      console.log('⚠️ Redis initialization failed (optional):', error.message);
      return false;
    }
  }

  // Set cache key with TTL (Time To Live in seconds)
  async set(key, value, ttl = 3600) {
    if (!this.initialized) return false;

    try {
      const data = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttl) {
        await this.redis.setex(key, ttl, data);
      } else {
        await this.redis.set(key, data);
      }

      return true;
    } catch (error) {
      console.error('❌ Cache set error:', error.message);
      return false;
    }
  }

  // Get cache key
  async get(key) {
    if (!this.initialized) return null;

    try {
      const data = await this.redis.get(key);
      if (!data) return null;

      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (error) {
      console.error('❌ Cache get error:', error.message);
      return null;
    }
  }

  // Delete cache key
  async delete(key) {
    if (!this.initialized) return false;

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('❌ Cache delete error:', error.message);
      return false;
    }
  }

  // Clear all cache
  async clear() {
    if (!this.initialized) return false;

    try {
      await this.redis.flushdb();
      console.log('🗑️ Cache cleared');
      return true;
    } catch (error) {
      console.error('❌ Cache clear error:', error.message);
      return false;
    }
  }

  // Get or fetch (cache-aside pattern)
  async getOrFetch(key, fetchFn, ttl = 3600) {
    if (!this.initialized) {
      // If Redis not available, just fetch
      return await fetchFn();
    }

    try {
      // Try to get from cache
      const cached = await this.get(key);
      if (cached) {
        console.log(`💾 Cache hit: ${key}`);
        return cached;
      }

      // Cache miss - fetch data
      console.log(`🔄 Cache miss: ${key} - fetching data`);
      const data = await fetchFn();

      // Store in cache
      await this.set(key, data, ttl);

      return data;
    } catch (error) {
      console.error('❌ Cache getOrFetch error:', error.message);
      return await fetchFn();
    }
  }

  // Increment counter (useful for rate limiting)
  async increment(key, amount = 1) {
    if (!this.initialized) return 0;

    try {
      return await this.redis.incrby(key, amount);
    } catch (error) {
      console.error('❌ Cache increment error:', error.message);
      return 0;
    }
  }

  // Set key expiration
  async expire(key, seconds) {
    if (!this.initialized) return false;

    try {
      await this.redis.expire(key, seconds);
      return true;
    } catch (error) {
      console.error('❌ Cache expire error:', error.message);
      return false;
    }
  }

  // Get keys matching pattern
  async keys(pattern) {
    if (!this.initialized) return [];

    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      console.error('❌ Cache keys error:', error.message);
      return [];
    }
  }

  // Get cache statistics
  async getStats() {
    if (!this.initialized) return null;

    try {
      const info = await this.redis.info('stats');
      const keys = await this.redis.dbsize();
      
      return {
        dbsize: keys,
        info: info
      };
    } catch (error) {
      console.error('❌ Cache stats error:', error.message);
      return null;
    }
  }

  // Close connection
  async close() {
    if (this.redis) {
      await this.redis.quit();
      console.log('🔌 Redis connection closed');
    }
  }
}

// Export singleton instance
module.exports = new CacheService();
