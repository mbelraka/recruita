import { APP_CONFIG } from '../config/app.config';
import { Languages } from '../enums/language.enum';
import type { Profile } from '../modules/main/models/profile.model';
import {
  buildSaveProfileRequest,
  profilePrivacyChoicesFrom,
} from './build-save-profile-request.util';

describe('build-save-profile-request.util', () => {
  const profile: Profile = {
    id: 'admin',
    privacyNoticeAccepted: true,
    lastLanguage: Languages.German,
    optionalRemoteTranslation: true,
    optionalGeocoding: false,
    optionalAiMatching: true,
  };

  it('buildSaveProfileRequest falls back to defaults when profile is null', () => {
    expect(buildSaveProfileRequest(null)).toEqual({
      id: APP_CONFIG.PROFILE.DEFAULT_ID,
      privacyNoticeAccepted: false,
      lastLanguage: APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE,
      optionalRemoteTranslation: false,
      optionalGeocoding: false,
      optionalAiMatching: false,
    });
  });

  it('buildSaveProfileRequest merges overrides onto the stored profile', () => {
    expect(
      buildSaveProfileRequest(profile, {
        lastLanguage: Languages.French,
        optionalGeocoding: true,
      })
    ).toEqual({
      id: APP_CONFIG.PROFILE.DEFAULT_ID,
      privacyNoticeAccepted: true,
      lastLanguage: Languages.French,
      optionalRemoteTranslation: true,
      optionalGeocoding: true,
      optionalAiMatching: true,
    });
  });

  it('profilePrivacyChoicesFrom maps stored profile flags', () => {
    expect(profilePrivacyChoicesFrom(profile)).toEqual({
      optionalRemoteTranslation: true,
      optionalGeocoding: false,
      optionalAiMatching: true,
    });
  });
});
