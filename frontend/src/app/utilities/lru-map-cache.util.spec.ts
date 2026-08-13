import { LruMapCache } from './lru-map-cache.util';

describe('LruMapCache', () => {
  it('stores and retrieves values', () => {
    const cache = new LruMapCache<readonly string[]>(2);
    cache.set('a', ['one']);
    expect(cache.get('a')).toEqual(['one']);
  });

  it('evicts the oldest entry when max size is exceeded', () => {
    const cache = new LruMapCache<string>(2);
    cache.set('a', '1');
    cache.set('b', '2');
    cache.get('a');
    cache.set('c', '3');

    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('a')).toBe('1');
    expect(cache.get('c')).toBe('3');
  });

  it('clears all entries', () => {
    const cache = new LruMapCache<string>(2);
    cache.set('a', '1');
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get('a')).toBeUndefined();
  });
});
