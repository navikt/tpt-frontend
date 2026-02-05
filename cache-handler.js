// In-memory cache handler for read-only containers
// Prevents filesystem writes while still caching fetch() and ISR in memory

const cache = new Map();

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options;
    this.cache = cache;
  }

  async get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (entry.expiresAt && entry.expiresAt < now) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key, data, ctx) {
    let expiresAt = null;
    
    if (ctx?.revalidate) {
      expiresAt = Date.now() + ctx.revalidate * 1000;
    } else if (ctx?.expire) {
      expiresAt = Date.now() + ctx.expire * 1000;
    }

    this.cache.set(key, {
      value: data,
      expiresAt,
      tags: ctx?.tags || [],
    });
  }

  async revalidateTag(tag) {
    // Remove all entries with this tag
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }
};
