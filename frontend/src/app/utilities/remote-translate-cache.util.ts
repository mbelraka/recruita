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

/** Inserts `key` as most-recent and drops oldest entries past `maxEntries`. */
export function putCappedStringRecord(
  current: Readonly<Record<string, string>>,
  key: string,
  value: string,
  maxEntries: number
): Record<string, string> {
  const next: Record<string, string> = { ...current };
  delete next[key];
  next[key] = value;
  const keys = Object.keys(next);
  const overflow = keys.length - maxEntries;
  if (overflow <= 0) {
    return next;
  }
  for (let index = 0; index < overflow; index += 1) {
    const oldestKey = keys[index];
    if (oldestKey !== undefined) {
      delete next[oldestKey];
    }
  }
  return next;
}
