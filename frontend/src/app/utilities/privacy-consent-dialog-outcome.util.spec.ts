import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { StateFeatures } from '../containers/root/enums/state-features.enum';
import type { PrivacyConsentFormState } from '../models/privacy-consent-form-state.model';
import { adapter } from '../modules/applicants/state/applicants.reducer';
import { ViewTypes } from '../modules/applicants/enums/view-types.enum';
import { initialAppState } from '../state/app.reducer';
import { PrivacyConsentService } from '../services/privacy-consent.service';

import {
  commitPrivacyConsentDialogOutcome,
  isPrivacyConsentDialogCloseResult,
} from './privacy-consent-dialog-outcome.util';

describe('privacy-consent-dialog-outcome.util', () => {
  describe('isPrivacyConsentDialogCloseResult', () => {
    it('accepts minimal known shapes', () => {
      expect(isPrivacyConsentDialogCloseResult({ mode: 'necessary' })).toBe(
        true
      );
      expect(isPrivacyConsentDialogCloseResult({ mode: 'all' })).toBe(true);
      const choices: PrivacyConsentFormState = {
        optionalRemoteTranslation: true,
        optionalGeocoding: false,
        optionalAiMatching: true,
      };
      expect(
        isPrivacyConsentDialogCloseResult({ mode: 'custom', choices })
      ).toBeTrue();
    });

    it('rejects invalid payloads', () => {
      expect(isPrivacyConsentDialogCloseResult(undefined)).toBeFalse();
      expect(isPrivacyConsentDialogCloseResult(null)).toBeFalse();
      expect(isPrivacyConsentDialogCloseResult({})).toBeFalse();
      expect(
        isPrivacyConsentDialogCloseResult({
          mode: 'custom',
          choices: { x: true },
        })
      ).toBeFalse();
    });
  });

  describe('commitPrivacyConsentDialogOutcome', () => {
    let svc: PrivacyConsentService;

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
      svc = TestBed.inject(PrivacyConsentService);
    });

    it('persist necessary / all / custom', () => {
      commitPrivacyConsentDialogOutcome(svc, { mode: 'necessary' });
      expect(svc.snapshot()?.optionalAiMatching).toBeFalse();

      commitPrivacyConsentDialogOutcome(svc, { mode: 'all' });
      expect(svc.snapshot()?.optionalAiMatching).toBeTrue();

      const choices: PrivacyConsentFormState = {
        optionalRemoteTranslation: false,
        optionalGeocoding: true,
        optionalAiMatching: false,
      };
      commitPrivacyConsentDialogOutcome(svc, {
        mode: 'custom',
        choices,
      });
      expect(svc.optionalGeocoding()).toBeTrue();
      expect(svc.optionalAiMatching()).toBeFalse();
    });

    it('ignores malformed results', () => {
      svc.saveAcceptAllOptional();
      commitPrivacyConsentDialogOutcome(svc, 'oops');
      expect(svc.snapshot()?.optionalAiMatching).toBeTrue();
    });
  });
});
