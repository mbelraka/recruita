import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import { isLanguage } from '../../../utilities/language.utils';
import type { Profile } from '../models/profile.model';

export type ProfileInit = Partial<{
  id: string;
  privacyNoticeAccepted: unknown;
  lastLanguage: unknown;
  optionalRemoteTranslation: unknown;
  optionalGeocoding: unknown;
  optionalAiMatching: unknown;
}>;

function coerceBoolean(value: unknown): boolean {
  return value === true;
}

function coerceLanguage(value: unknown): Languages {
  return isLanguage(value) ? value : APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE;
}

/** Builds a normalized profile row from API payloads, save requests, or partial init. */
export function createProfile(init?: ProfileInit): Profile {
  if (!init) {
    return {
      id: APP_CONFIG.PROFILE.DEFAULT_ID,
      privacyNoticeAccepted: false,
      lastLanguage: APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE,
      optionalRemoteTranslation: false,
      optionalGeocoding: false,
      optionalAiMatching: false,
    };
  }

  return {
    id: init.id ?? APP_CONFIG.PROFILE.DEFAULT_ID,
    privacyNoticeAccepted: coerceBoolean(init.privacyNoticeAccepted),
    lastLanguage: coerceLanguage(init.lastLanguage),
    optionalRemoteTranslation: coerceBoolean(init.optionalRemoteTranslation),
    optionalGeocoding: coerceBoolean(init.optionalGeocoding),
    optionalAiMatching: coerceBoolean(init.optionalAiMatching),
  };
}
