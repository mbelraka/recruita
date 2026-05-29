import { PrivacyConsentDialogMode } from '../enums/privacy-consent-dialog-mode.enum';
import type { PrivacyConsentFormState } from './privacy-consent-form-state.model';

/** Values emitted when the privacy consent dialog closes with a decision. */
export type PrivacyConsentDialogCloseResult =
  | { readonly mode: PrivacyConsentDialogMode.Necessary }
  | { readonly mode: PrivacyConsentDialogMode.All }
  | {
      readonly mode: PrivacyConsentDialogMode.Custom;
      readonly choices: PrivacyConsentFormState;
    };
