import { LruStringArrayCache } from './lru-string-cache.util';

describe('LruStringArrayCache', () => {
  it('stores and retrieves values', () => {
    const cache = new LruStringArrayCache(2);
    cache.set('a', ['one']);
    expect(cache.get('a')).toEqual(['one']);
  });

  it('evicts the oldest entry when max size is exceeded', () => {
    const cache = new LruStringArrayCache(2);
    cache.set('a', ['1']);
    cache.set('b', ['2']);
    cache.get('a');
    cache.set('c', ['3']);

    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('a')).toEqual(['1']);
    expect(cache.get('c')).toEqual(['3']);
  });
});
