import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import { createProfile } from './profile-domain.util';

describe('profile-domain.util', () => {
  it('returns defaults when no init is provided', () => {
    expect(createProfile()).toEqual({
      id: APP_CONFIG.PROFILE.DEFAULT_ID,
      privacyNoticeAccepted: false,
      lastLanguage: APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE,
      optionalRemoteTranslation: false,
      optionalGeocoding: false,
      optionalAiMatching: false,
    });
  });

  it('coerces API booleans strictly and falls back invalid language', () => {
    expect(
      createProfile({
        id: 'admin',
        privacyNoticeAccepted: 1 as unknown as boolean,
        lastLanguage: 'not-a-language',
        optionalRemoteTranslation: 'yes' as unknown as boolean,
        optionalGeocoding: false,
        optionalAiMatching: true,
      })
    ).toEqual({
      id: 'admin',
      privacyNoticeAccepted: false,
      lastLanguage: APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE,
      optionalRemoteTranslation: false,
      optionalGeocoding: false,
      optionalAiMatching: true,
    });
  });

  it('preserves typed save-request values', () => {
    expect(
      createProfile({
        id: APP_CONFIG.PROFILE.DEFAULT_ID,
        privacyNoticeAccepted: true,
        lastLanguage: Languages.French,
        optionalRemoteTranslation: true,
        optionalGeocoding: true,
        optionalAiMatching: false,
      })
    ).toEqual({
      id: APP_CONFIG.PROFILE.DEFAULT_ID,
      privacyNoticeAccepted: true,
      lastLanguage: Languages.French,
      optionalRemoteTranslation: true,
      optionalGeocoding: true,
      optionalAiMatching: false,
    });
  });
});
