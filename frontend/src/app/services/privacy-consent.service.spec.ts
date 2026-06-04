import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom } from 'rxjs';

import { APP_CONFIG } from '../config/app.config';
import { Languages } from '../enums/language.enum';
import { PRIVACY_CONSENT_VERSION } from '../constants/privacy.constants';
import { ViewTypes } from '../modules/applicants/enums/view-types.enum';
import { SortDirection } from '../modules/applicants/enums/sort-direction.enum';
import { initialAppState } from '../state/app.reducer';
import {
  buildApplicantEntityCache,
  buildProfileEntityCache,
  mergeEntityCaches,
  withEntityCache,
} from '../testing/entity-cache-test.util';

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

  const applicantUiState = {
    filter: '',
    sortBy: 'name' as const,
    sortDirection: SortDirection.Asc,
    filterBySkill: null,
    filterByStatus: null,
    filterByCountry: null,
    viewType: ViewTypes.GRID,
    locationSuggestions: [],
  };

  const mockStoreState = (options?: {
    profileLoaded?: boolean;
    profile?: typeof profile | null;
  }) => ({
    app: initialAppState,
    applicants: applicantUiState,
    ...withEntityCache(
      mergeEntityCaches(
        buildProfileEntityCache(options?.profile ?? null, {
          loaded: options?.profileLoaded ?? false,
        }),
        buildApplicantEntityCache([])
      )
    ),
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
    store.setState(mockStoreState({ profile, profileLoaded: true }));

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

    store.setState(mockStoreState({ profile, profileLoaded: true }));

    expect(await firstValueFrom(service.optionalAiMatching$())).toBeTrue();
  });

  it('buildDataExportJson$ includes consent version when profile accepted notice', async () => {
    store.setState(mockStoreState({ profile, profileLoaded: true }));

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
        profile: {
          ...profile,
          optionalRemoteTranslation: false,
          optionalGeocoding: true,
          optionalAiMatching: false,
        },
        profileLoaded: true,
      })
    );

    const json = await firstValueFrom(
      service.buildDataExportJson$({
        id: 'p-1',
        privacyNoticeAccepted: true,
        lastLanguage: Languages.German,
        optionalRemoteTranslation: true,
        optionalGeocoding: false,
        optionalAiMatching: true,
      })
    );

    const parsed = JSON.parse(json) as {
      profile: {
        id: string;
        optionalRemoteTranslation: boolean;
      } | null;
    };

    expect(parsed.profile?.id).toBe('p-1');
    expect(parsed.profile?.optionalRemoteTranslation).toBeTrue();
  });
});
