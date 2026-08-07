interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 500, defaultTTLms = 10 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTLms;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }
    this.store.set(key, {
      data,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTTL),
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}

export const searchCache = new MemoryCache(500, 10 * 60 * 1000);
export const suggestCache = new MemoryCache(1000, 60 * 60 * 1000);
export const hotelCache = new MemoryCache(200, 15 * 60 * 1000);

export function hashSearchParams(params: Record<string, string | number | boolean | string[] | undefined>): string {
  const sorted = Object.keys(params)
    .filter((k) => params[k] !== undefined)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return sorted;
}
