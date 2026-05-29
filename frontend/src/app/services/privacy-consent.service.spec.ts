import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom } from 'rxjs';

import { StateFeatures } from '../containers/root/enums/state-features.enum';
import { APP_CONFIG } from '../config/app.config';
import { Languages } from '../enums/language.enum';
import { PRIVACY_CONSENT_VERSION } from '../constants/privacy.constants';
import { adapter } from '../modules/applicants/state/applicants.reducer';
import { ViewTypes } from '../modules/applicants/enums/view-types.enum';
import { SortDirection } from '../modules/applicants/enums/sort-direction.enum';
import { initialMainState } from '../modules/main/state/main.reducer';
import { initialAppState } from '../state/app.reducer';

import { PrivacyConsentService } from './privacy-consent.service';

describe('PrivacyConsentService', () => {
  let service: PrivacyConsentService;
  let store: MockStore;

  const profile = {
    id: APP_CONFIG.PROFILE.DEFAULT_ID,
    privacyNoticeAccepted: true,
    lastLanguage: Languages.English,
    optionalRemoteTranslation: true,
    optionalGeocoding: false,
    optionalAiMatching: true,
  };

  const mockStoreState = (
    mainState: typeof initialMainState = initialMainState
  ) => ({
    app: initialAppState,
    [StateFeatures.Main]: mainState,
    [StateFeatures.Applicants]: adapter.getInitialState({
      loading: false,
      error: null,
      filter: '',
      sortBy: 'name',
      sortDirection: SortDirection.Asc,
      filterBySkill: null,
      filterByStatus: null,
      filterByCountry: null,
      viewType: ViewTypes.GRID,
      locationSuggestions: [],
    }),
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PrivacyConsentService,
        provideMockStore({
          initialState: mockStoreState(),
        }),
      ],
    });
    service = TestBed.inject(PrivacyConsentService);
    store = TestBed.inject(MockStore);
  });

  it('isConsentCompleteAndCurrent is false when profile is not loaded', () => {
    expect(service.isConsentCompleteAndCurrent()).toBeFalse();
  });

  it('formStateFromSnapshot defaults when profile is missing', () => {
    expect(service.formStateFromSnapshot()).toEqual({
      optionalRemoteTranslation: false,
      optionalGeocoding: false,
      optionalAiMatching: false,
    });
  });

  it('reads consent flags from the profile in store', () => {
    store.setState(
      mockStoreState({
        ...initialMainState,
        profile: {
          ...initialMainState.profile,
          profile,
          loaded: true,
        },
      })
    );

    expect(service.isConsentCompleteAndCurrent()).toBeTrue();
    expect(service.formStateFromSnapshot()).toEqual({
      optionalRemoteTranslation: true,
      optionalGeocoding: false,
      optionalAiMatching: true,
    });
    expect(service.optionalRemoteTranslation()).toBeTrue();
    expect(service.optionalGeocoding()).toBeFalse();
    expect(service.optionalAiMatching()).toBeTrue();
  });

  it('optionalAiMatching$ emits profile-backed consent changes', async () => {
    expect(await firstValueFrom(service.optionalAiMatching$())).toBeFalse();

    store.setState(
      mockStoreState({
        ...initialMainState,
        profile: {
          ...initialMainState.profile,
          profile,
          loaded: true,
        },
      })
    );

    expect(await firstValueFrom(service.optionalAiMatching$())).toBeTrue();
  });

  it('buildDataExportJson$ includes consent version when profile accepted notice', async () => {
    store.setState(
      mockStoreState({
        ...initialMainState,
        profile: {
          ...initialMainState.profile,
          profile,
          loaded: true,
        },
      })
    );

    const json = await firstValueFrom(service.buildDataExportJson$());
    const parsed = JSON.parse(json) as {
      privacyConsentVersion: number | null;
      language: Languages;
      applicants: unknown[];
      profile: null;
    };

    expect(parsed.privacyConsentVersion).toBe(PRIVACY_CONSENT_VERSION);
    expect(parsed.applicants).toEqual([]);
    expect(parsed.language).toBe(Languages.English);
    expect(parsed.profile).toBeNull();
  });

  it('buildDataExportJson$ includes provided profile snapshot', async () => {
    store.setState(
      mockStoreState({
        ...initialMainState,
        profile: {
          ...initialMainState.profile,
          profile: {
            ...profile,
            optionalRemoteTranslation: false,
            optionalGeocoding: true,
            optionalAiMatching: false,
          },
          loaded: true,
        },
      })
    );

    const json = await firstValueFrom(
      service.buildDataExportJson$({
        id: 'p-1',
        privacyNoticeAccepted: true,
        lastLanguage: Languages.German,
        optionalRemoteTranslation: false,
        optionalGeocoding: true,
        optionalAiMatching: false,
      })
    );
    const parsed = JSON.parse(json) as {
      profile: {
        id: string;
        privacyNoticeAccepted: boolean;
        lastLanguage: Languages;
        optionalRemoteTranslation: boolean;
        optionalGeocoding: boolean;
        optionalAiMatching: boolean;
      };
    };

    expect(parsed.profile).toEqual({
      id: 'p-1',
      privacyNoticeAccepted: true,
      lastLanguage: Languages.German,
      optionalRemoteTranslation: false,
      optionalGeocoding: true,
      optionalAiMatching: false,
    });
  });
});
