import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import {
  buildProfileEntityCache,
  withEntityCache,
} from '../../../testing/entity-cache-test.util';
import { selectAllowsAiMatching, selectProfileLoaded } from './main.selectors';

describe('Main selectors', () => {
  const adminProfile = {
    id: APP_CONFIG.PROFILE.DEFAULT_ID,
    privacyNoticeAccepted: true,
    lastLanguage: Languages.English,
    optionalRemoteTranslation: true,
    optionalGeocoding: true,
    optionalAiMatching: true,
  };

  it('selectProfileLoaded is true when admin profile is cached even if loaded flag is false', () => {
    const state = {
      ...withEntityCache(
        buildProfileEntityCache(adminProfile, { loaded: false })
      ),
    };

    expect(selectProfileLoaded(state)).toBeTrue();
  });

  it('selectAllowsAiMatching is true when consent and AI matching are enabled', () => {
    const state = {
      ...withEntityCache(
        buildProfileEntityCache(adminProfile, { loaded: false })
      ),
    };

    expect(selectAllowsAiMatching(state)).toBeTrue();
  });
});
