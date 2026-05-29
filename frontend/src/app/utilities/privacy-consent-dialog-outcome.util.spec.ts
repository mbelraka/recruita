import { PrivacyConsentDialogMode } from '../enums/privacy-consent-dialog-mode.enum';
import type { PrivacyConsentFormState } from '../models/privacy-consent-form-state.model';

import {
  isPrivacyConsentDialogCloseResult,
  privacyChoicesFromDialogResult,
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

  describe('privacyChoicesFromDialogResult', () => {
    it('maps dialog modes to stored consent flags', () => {
      expect(
        privacyChoicesFromDialogResult({
          mode: PrivacyConsentDialogMode.Necessary,
        })
      ).toEqual({
        optionalRemoteTranslation: false,
        optionalGeocoding: false,
        optionalAiMatching: false,
      });
      expect(
        privacyChoicesFromDialogResult({ mode: PrivacyConsentDialogMode.All })
      ).toEqual({
        optionalRemoteTranslation: true,
        optionalGeocoding: true,
        optionalAiMatching: true,
      });
      expect(
        privacyChoicesFromDialogResult({
          mode: PrivacyConsentDialogMode.Custom,
          choices: {
            optionalRemoteTranslation: true,
            optionalGeocoding: false,
            optionalAiMatching: true,
          },
        })
      ).toEqual({
        optionalRemoteTranslation: true,
        optionalGeocoding: false,
        optionalAiMatching: true,
      });
    });
  });
});
