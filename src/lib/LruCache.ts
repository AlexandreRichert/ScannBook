type Entry<T> = { value: T; expiresAt: number };

/** In-memory cache: keeps the `maxEntries` most recently used values, each for `ttlMs`. */
export class LruCache<T> {
  private readonly entries = new Map<string, Entry<T>>();
  private readonly maxEntries: number;
  private readonly ttlMs: number;

  constructor(maxEntries: number, ttlMs: number) {
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
  }

  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    this.entries.delete(key);
    if (entry.expiresAt <= Date.now()) return undefined;
    // Re-inserted last: a Map iterates in insertion order, so the first key is the least recently used.
    this.entries.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    while (this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest === undefined) break;
      this.entries.delete(oldest);
    }
  }
}
