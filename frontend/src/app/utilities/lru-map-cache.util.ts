/** LRU map for string keys. Recency follows `Map` insertion order. */
export class LruMapCache<T> {
  public constructor(private readonly _maxEntries: number) {}

  private readonly _entries = new Map<string, T>();

  public get(key: string): T | undefined {
    const value = this._entries.get(key);
    if (value === undefined) {
      return undefined;
    }
    this._entries.delete(key);
    this._entries.set(key, value);
    return value;
  }

  public set(key: string, value: T): void {
    if (this._entries.has(key)) {
      this._entries.delete(key);
    }
    this._entries.set(key, value);
    while (this._entries.size > this._maxEntries) {
      const oldest = this._entries.keys().next().value;
      if (oldest === undefined) {
        break;
      }
      this._entries.delete(oldest);
    }
  }

  public clear(): void {
    this._entries.clear();
  }

  public get size(): number {
    return this._entries.size;
  }
}
