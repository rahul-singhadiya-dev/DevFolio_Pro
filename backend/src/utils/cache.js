// src/utils/cache.js

const cache = new Map();

/**
 * Get cached item if it exists and is not expired
 * @param {string} key - Cache key
 * @returns {any|null} The cached value, or null if expired/non-existent
 */
const get = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.value;
};

/**
 * Store value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttlMs - Time-to-live in milliseconds (default: 1 hour)
 */
const set = (key, value, ttlMs = 1000 * 60 * 60) => {
  cache.set(key, {
    value,
    expiry: Date.now() + ttlMs
  });
};

/**
 * Delete a specific cache key
 * @param {string} key - Cache key
 */
const invalidate = (key) => {
  cache.delete(key);
};

/**
 * Invalidate all keys matching a prefix pattern (e.g. 'projects:')
 * @param {string} prefix - Key prefix
 */
const invalidatePattern = (prefix) => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
};

/**
 * Clear the entire cache
 */
const clear = () => {
  cache.clear();
};

module.exports = {
  get,
  set,
  invalidate,
  invalidatePattern,
  clear
};
