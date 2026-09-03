/**
 * Generic Least Recently Used (LRU) Cache implementation using ES6 Map.
 * In ES6 Map, insertion order is preserved. By deleting and re-setting an entry
 * on access, it moves to the end of the Map (Most Recently Used).
 * The first item in keys() is the Least Recently Used item.
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private readonly capacity: number

  constructor(capacity: number = 50) {
    if (capacity <= 0) {
      throw new Error('LRUCache capacity must be greater than 0')
    }
    this.capacity = capacity
  }

  public get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined
    }
    // Refresh access order (move to end)
    const val = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, val)
    return val
  }

  public set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      // Evict oldest (least recently used) key
      const oldestKey = this.cache.keys().next().value
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey)
      }
    }
    this.cache.set(key, value)
  }

  public has(key: K): boolean {
    return this.cache.has(key)
  }

  public clear(): void {
    this.cache.clear()
  }

  public get size(): number {
    return this.cache.size
  }
}
