/**
 * A service for caching API responses and files with optimized memory usage and TTL controls
 */

// Cache configuration
const CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  CLEANUP_INTERVAL: 60 * 1000, // 1 minute
  MAX_CACHE_SIZE: 100 * 1024 * 1024, // 100MB approximate limit
  PURGE_THRESHOLD: 0.8, // Purge when 80% full
};

// Cache item type with stronger typing
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  size: number; // Approximate size in bytes
  accessCount: number; // For LRU/LFU-like behavior
  lastAccessed: number; // For LRU-like behavior
}

// Cache store with improved type safety
const memoryCache: Map<string, CacheItem<unknown>> = new Map();
let currentCacheSize = 0; // Track approximate size

// Start a periodic cleanup to prevent memory leaks
const cleanupInterval = setInterval(() => {
  cleanExpiredItems();
}, CONFIG.CLEANUP_INTERVAL);

// Make sure to clear the interval if the module is unloaded
if (typeof module !== 'undefined' && (module as any).hot) {
  (module as any).hot.dispose(() => {
    clearInterval(cleanupInterval);
  });
}

/**
 * Calculates approximate size of data in bytes
 */
const calculateSize = (data: unknown): number => {
  try {
    // Basic size estimation
    const json = JSON.stringify(data);
    return json ? json.length * 2 : 0; // UTF-16 chars are 2 bytes
  } catch (e) {
    // For non-serializable objects, make a conservative estimate
    return 1024; // 1KB default for non-serializable data
  }
};

/**
 * Removes all expired items from the cache
 * @returns Number of items removed
 */
export const cleanExpiredItems = (): number => {
  const now = Date.now();
  let removedCount = 0;

  const keysToDelete: string[] = [];

  // Collect keys to delete first to avoid modifying while iterating
  memoryCache.forEach((item, key) => {
    if (now - item.timestamp > item.ttl) {
      keysToDelete.push(key);
    }
  });

  // Delete collected keys
  keysToDelete.forEach((key) => {
    const item = memoryCache.get(key);
    if (item) {
      currentCacheSize -= item.size;
      memoryCache.delete(key);
      removedCount++;
    }
  });

  return removedCount;
};

/**
 * Removes least valuable items when cache gets too large
 * Uses a combination of access frequency and recency
 */
const purgeCache = (targetSizeReduction: number): void => {
  if (memoryCache.size === 0) return;

  const now = Date.now();

  // Calculate value score for each item (lower is less valuable)
  const items = Array.from(memoryCache.entries()).map(([key, item]) => {
    // Score based on access count and recency
    const recencyScore = Math.max(0, (now - item.lastAccessed) / 60000); // Minutes since last access
    const frequencyScore = Math.log1p(item.accessCount);
    const ttlRatio = (item.timestamp + item.ttl - now) / item.ttl; // Remaining TTL ratio

    // Lower score = more likely to be purged
    const score = frequencyScore - recencyScore + ttlRatio;

    return { key, item, score };
  });

  // Sort by score (ascending - lowest value first)
  items.sort((a, b) => a.score - b.score);

  // Remove items until we've freed enough space
  let freedSize = 0;
  for (const { key, item } of items) {
    memoryCache.delete(key);
    freedSize += item.size;
    if (freedSize >= targetSizeReduction) break;
  }

  currentCacheSize -= freedSize;
};

/**
 * Gets an item from the cache
 * @param key The cache key
 * @returns The cached item or undefined if not found or expired
 */
export const getCacheItem = <T>(key: string): T | undefined => {
  const item = memoryCache.get(key) as CacheItem<T> | undefined;
  if (!item) return undefined;

  // Check if the item has expired
  if (Date.now() - item.timestamp > item.ttl) {
    // Remove expired item
    currentCacheSize -= item.size;
    memoryCache.delete(key);
    return undefined;
  }

  // Update access statistics
  item.accessCount++;
  item.lastAccessed = Date.now();

  return item.data;
};

/**
 * Sets an item in the cache
 * @param key The cache key
 * @param data The data to cache
 * @param ttl Optional TTL in milliseconds (defaults to 5 minutes)
 * @returns Boolean indicating if the operation was successful
 */
export const setCacheItem = <T>(
  key: string,
  data: T,
  ttl: number = CONFIG.DEFAULT_TTL
): boolean => {
  // Don't cache null or undefined values
  if (data === null || data === undefined) {
    if (memoryCache.has(key)) {
      const item = memoryCache.get(key);
      if (item) {
        currentCacheSize -= item.size;
      }
      memoryCache.delete(key);
    }
    return false;
  }

  const size = calculateSize(data);

  // If this single item is too large (>20% of max), don't cache
  if (size > CONFIG.MAX_CACHE_SIZE * 0.2) {
    return false;
  }

  // Check if we need to make room in the cache
  if (currentCacheSize + size > CONFIG.MAX_CACHE_SIZE) {
    // If existing item, account for size difference
    const existingSize = memoryCache.has(key)
      ? (memoryCache.get(key) as CacheItem<unknown>).size
      : 0;

    const sizeIncrease = size - existingSize;

    if (
      sizeIncrease > 0 &&
      currentCacheSize + sizeIncrease > CONFIG.MAX_CACHE_SIZE
    ) {
      // Need to purge - calculate how much to remove, plus 20% extra for headroom
      const targetReduction =
        (currentCacheSize +
          sizeIncrease -
          CONFIG.MAX_CACHE_SIZE * CONFIG.PURGE_THRESHOLD) *
        1.2;
      purgeCache(targetReduction);
    }
  }

  // If replacing, remove old size from total
  if (memoryCache.has(key)) {
    const oldItem = memoryCache.get(key);
    if (oldItem) {
      currentCacheSize -= oldItem.size;
    }
  }

  // Add new item
  const now = Date.now();
  memoryCache.set(key, {
    data,
    timestamp: now,
    ttl,
    size,
    accessCount: 1,
    lastAccessed: now,
  });

  currentCacheSize += size;
  return true;
};

/**
 * Removes an item from the cache
 * @param key The cache key
 * @returns Boolean indicating if an item was removed
 */
export const removeCacheItem = (key: string): boolean => {
  const item = memoryCache.get(key);
  if (item) {
    currentCacheSize -= item.size;
    memoryCache.delete(key);
    return true;
  }
  return false;
};

/**
 * Clears all items from the cache
 */
export const clearCache = (): void => {
  memoryCache.clear();
  currentCacheSize = 0;
};

/**
 * Performs a cached API request with customizable TTL
 * @param cacheKey The cache key
 * @param apiCall The API call function
 * @param ttl Optional cache TTL in milliseconds
 * @returns The result of the API call (either from cache or fresh)
 */
export const cachedApiCall = async <T>(
  cacheKey: string,
  apiCall: () => Promise<T>,
  ttl: number = CONFIG.DEFAULT_TTL
): Promise<T> => {
  // Check if the data is in the cache
  const cachedData = getCacheItem<T>(cacheKey);
  if (cachedData !== undefined) {
    return cachedData;
  }

  try {
    // If not in cache, make the API call
    const data = await apiCall();

    // Cache the result (only if not null/undefined)
    if (data !== null && data !== undefined) {
      setCacheItem(cacheKey, data, ttl);
    }

    return data;
  } catch (error) {
    // Don't cache errors
    console.error(`Cache API call failed for key ${cacheKey}:`, error);
    throw error;
  }
};

/**
 * Checks if a key exists in the cache and is not expired
 * @param key The cache key to check
 * @returns Boolean indicating if the key exists and is valid
 */
export const hasCacheItem = (key: string): boolean => {
  const item = memoryCache.get(key);
  if (!item) return false;

  // Check if the item has expired
  if (Date.now() - item.timestamp > item.ttl) {
    // Remove expired item
    currentCacheSize -= item.size;
    memoryCache.delete(key);
    return false;
  }

  return true;
};

/**
 * Extends the expiration time of an existing cache item
 * @param key The cache key
 * @param additionalTime Additional time in milliseconds to extend
 * @returns Boolean indicating if the extension was successful
 */
export const extendCacheTTL = (
  key: string,
  additionalTime: number
): boolean => {
  const item = memoryCache.get(key);
  if (!item) return false;

  // Reset the timestamp to now, effectively extending the TTL
  item.timestamp = Date.now();
  return true;
};

/**
 * Gets cache statistics
 * @returns Detailed statistics about the current cache state
 */
export const getCacheStats = (): {
  totalItems: number;
  currentSizeInBytes: number;
  maxSizeInBytes: number;
  usagePercentage: number;
  oldestItemAge: number;
  keysByPrefix: Record<string, number>;
  averageAccessCount: number;
} => {
  const now = Date.now();
  let oldestTimestamp = now;
  const prefixCounts: Record<string, number> = {};
  let totalAccessCount = 0;

  // Use forEach instead of for...of to avoid TypeScript errors
  memoryCache.forEach((item, key) => {
    // Track oldest item
    if (item.timestamp < oldestTimestamp) {
      oldestTimestamp = item.timestamp;
    }

    // Count by key prefix
    const prefix = key.split(':')[0] || 'unknown';
    prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;

    // Sum access counts
    totalAccessCount += item.accessCount;
  });

  const itemCount = memoryCache.size;
  const averageAccessCount = itemCount > 0 ? totalAccessCount / itemCount : 0;

  return {
    totalItems: itemCount,
    currentSizeInBytes: currentCacheSize,
    maxSizeInBytes: CONFIG.MAX_CACHE_SIZE,
    usagePercentage: (currentCacheSize / CONFIG.MAX_CACHE_SIZE) * 100,
    oldestItemAge: now - oldestTimestamp,
    keysByPrefix: prefixCounts,
    averageAccessCount,
  };
};

/**
 * Returns keys matching a pattern
 * @param pattern Regex pattern to match against keys
 * @returns Array of matching keys
 */
export const getKeysByPattern = (pattern: RegExp): string[] => {
  return Array.from(memoryCache.keys()).filter((key) => pattern.test(key));
};
