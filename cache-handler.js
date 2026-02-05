// No-op cache handler to prevent ISR filesystem writes in read-only containers
// This only affects ISR/prerender cache, not fetch() cache which uses in-memory LRU

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options;
  }

  async get() {
    return null;
  }

  async set() {
    // No-op: don't write to filesystem
  }

  async revalidateTag() {
    // No-op
  }
};
