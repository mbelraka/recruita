import { TranslateService } from '@ngx-translate/core';

import {
  NON_ALPHANUMERIC_TO_SPACE,
  UNICODE_COMBINING_MARKS,
  WHITESPACE_RUN,
} from './reg-ex';

function toLocalizationKeySegment(value: string): string {
  const normalized = value
    .normalize('NFKD')
    .replace(UNICODE_COMBINING_MARKS, '')
    .replace(NON_ALPHANUMERIC_TO_SPACE, ' ')
    .trim();

  if (!normalized) {
    return '';
  }

  const parts = normalized.split(WHITESPACE_RUN);
  return parts
    .map((part, index) => {
      const lower = part.toLowerCase();
      if (index === 0) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

/** `TranslateService.instant` is typed as `any`; narrow to a string for safe use. */
export function translateInstantString(
  translate: TranslateService,
  key: string
): string {
  const value: unknown = translate.instant(key);
  return typeof value === 'string' ? value : key;
}

export function localizeTextByNamespace(
  value: string,
  namespace: string,
  translate: TranslateService
): string {
  const raw = value.trim();
  if (!raw || !namespace.trim()) {
    return raw;
  }

  const keySegment = toLocalizationKeySegment(raw);
  if (!keySegment) {
    return raw;
  }

  const key = `${namespace}.${keySegment}`;
  const translated = translateInstantString(translate, key);
  return translated === key ? raw : translated;
}
