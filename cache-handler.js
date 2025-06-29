const { IncrementalCache } = require('next/dist/server/lib/incremental-cache');

class CustomCacheHandler extends IncrementalCache {
  constructor(options) {
    super(options);
  }

  async get(key) {
    try {
      return await super.get(key);
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  async set(key, data, options) {
    try {
      await super.set(key, data, options);
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  async delete(key) {
    try {
      await super.delete(key);
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }
}

module.exports = CustomCacheHandler; 