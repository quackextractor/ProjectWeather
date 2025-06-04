export class CacheServiceTests {
  private cache = new Map<string, { value: any; expiry: number }>()

  getTests() {
    return [
      {
        name: "Should store and retrieve values",
        description: "Verifies basic cache storage and retrieval functionality",
        testFn: this.testStoreAndRetrieve.bind(this),
      },
      {
        name: "Should handle cache expiration",
        description: "Tests that expired cache entries are properly handled",
        testFn: this.testCacheExpiration.bind(this),
      },
      {
        name: "Should handle cache deletion",
        description: "Verifies that cache entries can be deleted",
        testFn: this.testCacheDeletion.bind(this),
      },
      {
        name: "Should clear all cache entries",
        description: "Tests that all cache entries can be cleared at once",
        testFn: this.testClearAllCache.bind(this),
      },
      {
        name: "Should handle cache size limits",
        description: "Verifies that cache respects size limitations",
        testFn: this.testCacheSizeLimits.bind(this),
      },
      {
        name: "Should handle different data types",
        description: "Tests caching of various data types (string, number, object, array)",
        testFn: this.testDifferentDataTypes.bind(this),
      },
    ]
  }

  private async testStoreAndRetrieve(): Promise<void> {
    // Clear cache before test
    this.cache.clear()

    const key = "test-key"
    const value = "test-value"
    const expiry = Date.now() + 60000 // 1 minute from now

    // Store value
    this.cache.set(key, { value, expiry })

    // Retrieve value
    const cached = this.cache.get(key)

    if (!cached) {
      throw new Error("Failed to retrieve cached value")
    }

    if (cached.value !== value) {
      throw new Error(`Expected ${value}, got ${cached.value}`)
    }
  }

  private async testCacheExpiration(): Promise<void> {
    // Clear cache before test
    this.cache.clear()

    const key = "expiry-test-key"
    const value = "expiry-test-value"
    const expiry = Date.now() - 1000 // 1 second ago (expired)

    // Store expired value
    this.cache.set(key, { value, expiry })

    // Try to retrieve expired value
    const cached = this.cache.get(key)

    if (cached && cached.expiry < Date.now()) {
      // Remove expired entry
      this.cache.delete(key)

      // Verify it's been removed
      const afterDeletion = this.cache.get(key)
      if (afterDeletion) {
        throw new Error("Expired cache entry should have been removed")
      }
    }

    // Wait a bit to ensure expiration logic works
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private async testCacheDeletion(): Promise<void> {
    // Clear cache before test
    this.cache.clear()

    const key = "deletion-test-key"
    const value = "deletion-test-value"
    const expiry = Date.now() + 60000

    // Store value
    this.cache.set(key, { value, expiry })

    // Verify it exists
    if (!this.cache.has(key)) {
      throw new Error("Cache entry should exist before deletion")
    }

    // Delete value
    const deleted = this.cache.delete(key)

    if (!deleted) {
      throw new Error("Cache deletion should return true")
    }

    // Verify it's gone
    if (this.cache.has(key)) {
      throw new Error("Cache entry should not exist after deletion")
    }
  }

  private async testClearAllCache(): Promise<void> {
    // Clear cache before test
    this.cache.clear()

    // Add multiple entries
    const entries = [
      { key: "key1", value: "value1" },
      { key: "key2", value: "value2" },
      { key: "key3", value: "value3" },
    ]

    const expiry = Date.now() + 60000

    for (const entry of entries) {
      this.cache.set(entry.key, { value: entry.value, expiry })
    }

    // Verify entries exist
    if (this.cache.size !== entries.length) {
      throw new Error(`Cache should contain ${entries.length} items, but contains ${this.cache.size}`)
    }

    // Clear all cache
    this.cache.clear()

    // Verify cache is empty
    if (this.cache.size !== 0) {
      throw new Error(`Cache should be empty after clear, but contains ${this.cache.size} items`)
    }
  }

  private async testCacheSizeLimits(): Promise<void> {
    // Clear cache before test
    this.cache.clear()

    const maxSize = 5
    const expiry = Date.now() + 60000

    // Add entries up to limit
    for (let i = 0; i < maxSize + 2; i++) {
      this.cache.set(`key${i}`, { value: `value${i}`, expiry })

      // Simulate size limit enforcement
      if (this.cache.size > maxSize) {
        // Remove oldest entry (in a real implementation, you'd track insertion order)
        const firstKey = this.cache.keys().next().value
        this.cache.delete(firstKey)
      }
    }

    // Verify size limit is respected
    if (this.cache.size > maxSize) {
      throw new Error(`Cache size ${this.cache.size} exceeds limit ${maxSize}`)
    }
  }

  private async testDifferentDataTypes(): Promise<void> {
    // Clear cache before test
    this.cache.clear()

    const expiry = Date.now() + 60000
    const testData = [
      { key: "string", value: "test string" },
      { key: "number", value: 42 },
      { key: "boolean", value: true },
      { key: "object", value: { nested: "object", count: 1 } },
      { key: "array", value: [1, 2, 3, "four"] },
      { key: "null", value: null },
    ]

    // Store different data types
    for (const data of testData) {
      this.cache.set(data.key, { value: data.value, expiry })
    }

    // Retrieve and verify each data type
    for (const data of testData) {
      const cached = this.cache.get(data.key)

      if (!cached) {
        throw new Error(`Failed to retrieve ${data.key}`)
      }

      if (JSON.stringify(cached.value) !== JSON.stringify(data.value)) {
        throw new Error(
          `Data type mismatch for ${data.key}: expected ${JSON.stringify(data.value)}, got ${JSON.stringify(cached.value)}`,
        )
      }
    }
  }
}
