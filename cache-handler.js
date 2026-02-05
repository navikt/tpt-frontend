// In-memory cache handler for read-only containers
// Prevents filesystem writes while still caching fetch() and ISR in memory
// 
// This implements the Next.js CacheHandler interface for custom caching.
// The cache entries are already structured by Next.js with proper metadata,
// so we just store and retrieve them as-is.

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

    // Check if entry has expired based on lastModified and revalidate
    if (entry.value?.revalidate) {
      const now = Date.now();
      const age = now - (entry.lastModified || 0);
      if (age > entry.value.revalidate * 1000) {
        this.cache.delete(key);
        return null;
      }
    }

    return entry;
  }

  async set(key, data, ctx) {
    // Next.js passes the complete cache entry structure in 'data'
    // which includes { kind, value, revalidate, tags, etc. }
    // We store it as-is with a timestamp
    this.cache.set(key, {
      value: data,
      lastModified: Date.now(),
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

  resetRequestCache() {
    // This is called between requests to clear request-scoped cache
    // For our in-memory cache, we don't need to do anything here
  }
};
