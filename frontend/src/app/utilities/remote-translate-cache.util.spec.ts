import { APP_CONFIG } from '../config/app.config';
import { Languages } from '../enums/language.enum';
import {
  buildRemoteTranslationCacheKey,
  buildRemoteTranslationLangPair,
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
});
