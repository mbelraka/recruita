/** Simple LRU cache for string keys → string array values (e.g. geocode labels). */
export class LruStringArrayCache {
  public constructor(private readonly _maxEntries: number) {}

  private readonly _entries = new Map<string, readonly string[]>();

  public get(key: string): readonly string[] | undefined {
    const value = this._entries.get(key);
    if (value === undefined) {
      return undefined;
    }
    this._entries.delete(key);
    this._entries.set(key, value);
    return value;
  }

  public set(key: string, value: readonly string[]): void {
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
}
