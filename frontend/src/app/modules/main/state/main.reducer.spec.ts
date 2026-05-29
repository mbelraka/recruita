import {
  clearProfileState,
  loadProfile,
  loadProfileFailure,
  loadProfileSuccess,
  persistPrivacyConsentOutcome,
  persistPrivacyConsentOutcomeSuccess,
  profileUpdated,
} from './profile.actions';
import { PrivacyConsentDialogMode } from '../../../enums/privacy-consent-dialog-mode.enum';
import { Languages } from '../../../enums/language.enum';
import {
  initialMainState,
  initialProfileState,
  mainReducer,
} from './main.reducer';

describe('mainReducer', () => {
  const profile = {
    id: 'admin',
    privacyNoticeAccepted: false,
    lastLanguage: Languages.English,
    optionalRemoteTranslation: false,
    optionalGeocoding: false,
    optionalAiMatching: false,
  };

  it('returns the initial state', () => {
    expect(mainReducer(undefined, { type: 'unknown' })).toEqual(
      initialMainState
    );
  });

  it('sets profile loading on loadProfile', () => {
    const state = mainReducer(initialMainState, loadProfile());
    expect(state.profile.loading).toBeTrue();
  });

  it('stores the profile on loadProfileSuccess', () => {
    const state = mainReducer(
      {
        ...initialMainState,
        profile: { ...initialProfileState, loading: true },
      },
      loadProfileSuccess({ profile })
    );
    expect(state.profile.profile).toEqual(profile);
    expect(state.profile.loaded).toBeTrue();
    expect(state.profile.loading).toBeFalse();
  });

  it('clears the profile on loadProfileFailure', () => {
    const state = mainReducer(
      {
        ...initialMainState,
        profile: { ...initialProfileState, profile, loading: true },
      },
      loadProfileFailure({ error: 'offline' })
    );
    expect(state.profile.profile).toBeNull();
    expect(state.profile.error).toBe('offline');
  });

  it('resets profile state on clearProfileState', () => {
    const state = mainReducer(
      {
        ...initialMainState,
        profile: {
          profile: {
            id: 'admin',
            privacyNoticeAccepted: true,
            lastLanguage: Languages.English,
            optionalRemoteTranslation: true,
            optionalGeocoding: true,
            optionalAiMatching: true,
          },
          loading: false,
          loaded: true,
          error: null,
        },
      },
      clearProfileState()
    );
    expect(state).toEqual(initialMainState);
  });

  it('stores the profile when privacy consent is persisted', () => {
    const accepted = {
      id: 'admin',
      privacyNoticeAccepted: true,
      lastLanguage: Languages.German,
      optionalRemoteTranslation: false,
      optionalGeocoding: true,
      optionalAiMatching: false,
    };
    const pending = mainReducer(
      initialMainState,
      persistPrivacyConsentOutcome({
        result: { mode: PrivacyConsentDialogMode.Necessary },
      })
    );
    expect(pending.profile.loading).toBeTrue();

    const state = mainReducer(
      pending,
      persistPrivacyConsentOutcomeSuccess({ profile: accepted })
    );
    expect(state.profile.profile).toEqual(accepted);
  });

  it('updates profile on profileUpdated', () => {
    const updated = {
      id: 'admin',
      privacyNoticeAccepted: false,
      lastLanguage: Languages.French,
      optionalRemoteTranslation: false,
      optionalGeocoding: false,
      optionalAiMatching: false,
    };
    const state = mainReducer(
      {
        ...initialMainState,
        profile: { ...initialProfileState, profile },
      },
      profileUpdated({ profile: updated })
    );
    expect(state.profile.profile).toEqual(updated);
  });
});
