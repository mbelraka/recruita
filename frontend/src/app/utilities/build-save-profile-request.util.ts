import { APP_CONFIG } from '../config/app.config';
import { PRIVACY_NOTICE_ACCEPTED } from '../constants/privacy.constants';
import { Languages } from '../enums/language.enum';
import type { PrivacyConsentFormState } from '../models/privacy-consent-form-state.model';
import type { Profile } from '../modules/main/models/profile.model';
import type { SaveProfileRequest } from '../modules/main/models/save-profile-request.model';

export const DEFAULT_DISABLED_PRIVACY_CHOICES: PrivacyConsentFormState = {
  optionalRemoteTranslation: false,
  optionalGeocoding: false,
  optionalAiMatching: false,
} as const;

export function buildSaveProfileRequest(
  profile: Profile | null,
  overrides: Partial<Omit<SaveProfileRequest, 'id'>> = {}
): SaveProfileRequest {
  return {
    id: APP_CONFIG.PROFILE.DEFAULT_ID,
    privacyNoticeAccepted:
      overrides.privacyNoticeAccepted ??
      profile?.privacyNoticeAccepted ??
      false,
    lastLanguage:
      overrides.lastLanguage ??
      profile?.lastLanguage ??
      APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE,
    optionalRemoteTranslation:
      overrides.optionalRemoteTranslation ??
      profile?.optionalRemoteTranslation ??
      false,
    optionalGeocoding:
      overrides.optionalGeocoding ?? profile?.optionalGeocoding ?? false,
    optionalAiMatching:
      overrides.optionalAiMatching ?? profile?.optionalAiMatching ?? false,
  };
}

export function buildPrivacyConsentSaveRequest(
  profile: Profile | null,
  language: Languages,
  choices: PrivacyConsentFormState
): SaveProfileRequest {
  return buildSaveProfileRequest(profile, {
    privacyNoticeAccepted: PRIVACY_NOTICE_ACCEPTED,
    lastLanguage: language,
    ...choices,
  });
}

export function profilePrivacyChoicesFrom(
  profile: Pick<
    Profile,
    'optionalRemoteTranslation' | 'optionalGeocoding' | 'optionalAiMatching'
  >
): PrivacyConsentFormState {
  return {
    optionalRemoteTranslation: profile.optionalRemoteTranslation,
    optionalGeocoding: profile.optionalGeocoding,
    optionalAiMatching: profile.optionalAiMatching,
  };
}
