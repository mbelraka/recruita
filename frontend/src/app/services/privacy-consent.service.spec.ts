import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { StateFeatures } from '../containers/root/enums/state-features.enum';
import { Languages } from '../enums/language.enum';
import { PRIVACY_CONSENT_VERSION } from '../constants/privacy.constants';
import { adapter } from '../modules/applicants/state/applicants.reducer';
import { ViewTypes } from '../modules/applicants/enums/view-types.enum';
import { initialAppState } from '../state/app.reducer';

import { PrivacyConsentService } from './privacy-consent.service';

describe('PrivacyConsentService', () => {
  let service: PrivacyConsentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PrivacyConsentService,
        provideMockStore({
          initialState: {
            app: initialAppState,
            [StateFeatures.Applicants]: adapter.getInitialState({
              loading: false,
              error: null,
              filter: '',
              sortBy: 'name',
              sortDirection: 'asc',
              filterBySkill: null,
              filterByStatus: null,
              filterByCountry: null,
              viewType: ViewTypes.GRID,
              locationSuggestions: [],
            }),
          },
        }),
      ],
    });
    service = TestBed.inject(PrivacyConsentService);
  });

  it('isConsentCompleteAndCurrent is false when nothing stored', () => {
    expect(service.isConsentCompleteAndCurrent()).toBeFalse();
  });

  it('formStateFromSnapshot defaults when no consent', () => {
    expect(service.formStateFromSnapshot()).toEqual({
      optionalRemoteTranslation: false,
      optionalGeocoding: false,
      optionalAiMatching: false,
    });
  });

  it('formStateFromSnapshot mirrors stored consent', () => {
    service.saveCustom({
      optionalRemoteTranslation: true,
      optionalGeocoding: false,
      optionalAiMatching: true,
    });
    expect(service.formStateFromSnapshot()).toEqual({
      optionalRemoteTranslation: true,
      optionalGeocoding: false,
      optionalAiMatching: true,
    });
  });

  it('saveNecessaryOnly clears optional toggles', () => {
    service.saveNecessaryOnly();
    const snap = service.snapshot();

    expect(snap?.complete).toBeTrue();
    expect(snap?.version).toBe(PRIVACY_CONSENT_VERSION);
    expect(snap?.optionalRemoteTranslation).toBeFalse();
    expect(snap?.optionalGeocoding).toBeFalse();
    expect(snap?.optionalAiMatching).toBeFalse();

    expect(service.isConsentCompleteAndCurrent()).toBeTrue();
    expect(service.optionalAiMatching()).toBeFalse();
  });

  it('saveAcceptAllOptional enables all optional flags', () => {
    service.saveAcceptAllOptional();
    expect(service.optionalAiMatching()).toBeTrue();
    expect(service.optionalGeocoding()).toBeTrue();
    expect(service.optionalRemoteTranslation()).toBeTrue();
  });

  it('saveCustom persists mixed choices', () => {
    service.saveCustom({
      optionalRemoteTranslation: true,
      optionalGeocoding: false,
      optionalAiMatching: true,
    });
    expect(service.optionalRemoteTranslation()).toBeTrue();
    expect(service.optionalGeocoding()).toBeFalse();
    expect(service.optionalAiMatching()).toBeTrue();
  });

  it('resetConsentDecision clears consent and snapshot', () => {
    service.saveNecessaryOnly();
    expect(service.snapshot()).not.toBeNull();

    service.resetConsentDecision();

    expect(service.snapshot()).toBeNull();
  });

  it('isConsentCompleteAndCurrent is false when consent is incomplete', () => {
    (
      service as unknown as {
        _persist: (record: {
          version: number;
          savedAtIso: string;
          complete: boolean;
          optionalRemoteTranslation: boolean;
          optionalGeocoding: boolean;
          optionalAiMatching: boolean;
        }) => void;
      }
    )._persist({
      version: PRIVACY_CONSENT_VERSION,
      savedAtIso: '2026-01-01T00:00:00.000Z',
      complete: false,
      optionalRemoteTranslation: false,
      optionalGeocoding: false,
      optionalAiMatching: false,
    });

    expect(service.isConsentCompleteAndCurrent()).toBeFalse();
  });

  it('isConsentCompleteAndCurrent is false when consent version is stale', () => {
    (
      service as unknown as {
        _persist: (record: {
          version: number;
          savedAtIso: string;
          complete: boolean;
          optionalRemoteTranslation: boolean;
          optionalGeocoding: boolean;
          optionalAiMatching: boolean;
        }) => void;
      }
    )._persist({
      version: 0,
      savedAtIso: '2026-01-01T00:00:00.000Z',
      complete: true,
      optionalRemoteTranslation: true,
      optionalGeocoding: true,
      optionalAiMatching: true,
    });

    expect(service.isConsentCompleteAndCurrent()).toBeFalse();
  });

  it('hydrateFromProfile restores stored consent choices', () => {
    service.hydrateFromProfile({
      optionalRemoteTranslation: true,
      optionalGeocoding: false,
      optionalAiMatching: true,
    });
    expect(service.isConsentCompleteAndCurrent()).toBeTrue();
    expect(service.optionalRemoteTranslation()).toBeTrue();
    expect(service.optionalGeocoding()).toBeFalse();
    expect(service.optionalAiMatching()).toBeTrue();
  });

  it('buildDataExportJson$ includes consent version and language', async () => {
    service.saveAcceptAllOptional();
    const json = await new Promise<string>((resolve) => {
      service.buildDataExportJson$().subscribe(resolve);
    });
    const parsed = JSON.parse(json) as {
      privacyConsentVersion: number;
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
    service.saveNecessaryOnly();
    const json = await new Promise<string>((resolve) => {
      service
        .buildDataExportJson$({
          id: 'p-1',
          privacyNoticeAccepted: true,
          lastLanguage: Languages.German,
          optionalRemoteTranslation: false,
          optionalGeocoding: true,
          optionalAiMatching: false,
        })
        .subscribe(resolve);
    });
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
