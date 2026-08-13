import { APP_CONFIG } from '../config/app.config';
import { Languages } from '../enums/language.enum';
import {
  buildRemoteTranslationCacheKey,
  buildRemoteTranslationLangPair,
  putCappedStringRecord,
} from './remote-translate-cache.util';

describe('remote-translate-cache.util', () => {
  it('buildRemoteTranslationCacheKey joins language pair and text', () => {
    expect(
      buildRemoteTranslationCacheKey(
        Languages.English,
        Languages.German,
        'Software engineer'
      )
    ).toBe(
      `en${APP_CONFIG.TRANSLATION.CACHE_KEY_SEGMENT_SEPARATOR}de${APP_CONFIG.TRANSLATION.CACHE_KEY_SEGMENT_SEPARATOR}Software engineer`
    );
  });

  it('buildRemoteTranslationLangPair uses the configured separator', () => {
    expect(
      buildRemoteTranslationLangPair(Languages.English, Languages.German)
    ).toBe(`en${APP_CONFIG.TRANSLATION.LANGPAIR_SEPARATOR}de`);
  });

  it('putCappedStringRecord evicts the oldest key when over max', () => {
    const capped = putCappedStringRecord(
      putCappedStringRecord({ a: '1' }, 'b', '2', 2),
      'c',
      '3',
      2
    );
    expect(capped).toEqual({ b: '2', c: '3' });
  });

  it('putCappedStringRecord refreshes an existing key as most recent', () => {
    const capped = putCappedStringRecord(
      putCappedStringRecord({ a: '1', b: '2' }, 'a', '1-updated', 2),
      'c',
      '3',
      2
    );
    expect(capped).toEqual({ a: '1-updated', c: '3' });
  });
});
