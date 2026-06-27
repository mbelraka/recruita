import { PrivacyConsentDialogMode } from '../enums/privacy-consent-dialog-mode.enum';
import type { PrivacyConsentDialogCloseResult } from '../models/privacy-consent-dialog-close-result.model';
import type { PrivacyConsentFormState } from '../models/privacy-consent-form-state.model';

const ALL_DISABLED: PrivacyConsentFormState = {
  optionalRemoteTranslation: false,
  optionalGeocoding: false,
  optionalAiMatching: false,
};

const ALL_ENABLED: PrivacyConsentFormState = {
  optionalRemoteTranslation: true,
  optionalGeocoding: true,
  optionalAiMatching: true,
};

function isPrivacyConsentFormState(
  value: unknown
): value is PrivacyConsentFormState {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const o = value as Record<string, unknown>;
  return (
    typeof o['optionalRemoteTranslation'] === 'boolean' &&
    typeof o['optionalGeocoding'] === 'boolean' &&
    typeof o['optionalAiMatching'] === 'boolean'
  );
}

export function isPrivacyConsentDialogCloseResult(
  value: unknown
): value is PrivacyConsentDialogCloseResult {
  if (value === null || typeof value !== 'object' || !('mode' in value)) {
    return false;
  }
  const mode = (value as { mode: unknown }).mode;
  if (
    mode === PrivacyConsentDialogMode.Necessary ||
    mode === PrivacyConsentDialogMode.All
  ) {
    return true;
  }
  if (mode !== PrivacyConsentDialogMode.Custom) {
    return false;
  }
  if (!('choices' in value)) {
    return false;
  }
  return isPrivacyConsentFormState((value as { choices: unknown }).choices);
}

/** Maps a dialog close payload to the consent flags stored on the profile. */
export function privacyChoicesFromDialogResult(
  result: PrivacyConsentDialogCloseResult
): PrivacyConsentFormState {
  switch (result.mode) {
    case PrivacyConsentDialogMode.Necessary: {
      return ALL_DISABLED;
    }
    case PrivacyConsentDialogMode.All: {
      return ALL_ENABLED;
    }
    case PrivacyConsentDialogMode.Custom: {
      return result.choices;
    }
    default: {
      const _exhaustive: never = result;
      return _exhaustive;
    }
  }
}
