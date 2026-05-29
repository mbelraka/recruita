import { APP_CONFIG } from '../config/app.config';
import { Languages } from '../enums/language.enum';

export function buildRemoteTranslationCacheKey(
  from: Languages,
  to: Languages,
  rawText: string
): string {
  const { CACHE_KEY_SEGMENT_SEPARATOR } = APP_CONFIG.TRANSLATION;
  return `${from}${CACHE_KEY_SEGMENT_SEPARATOR}${to}${CACHE_KEY_SEGMENT_SEPARATOR}${rawText}`;
}

export function buildRemoteTranslationLangPair(
  from: Languages,
  to: Languages
): string {
  return `${from}${APP_CONFIG.TRANSLATION.LANGPAIR_SEPARATOR}${to}`;
}
