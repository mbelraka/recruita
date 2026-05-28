import { Languages } from '../../../enums/language.enum';

/** Request body for POST/PUT `/api/profiles`. */
export interface SaveProfileRequest {
  readonly id: string;
  readonly privacyNoticeAccepted: boolean;
  readonly lastLanguage: Languages;
  readonly optionalRemoteTranslation: boolean;
  readonly optionalGeocoding: boolean;
  readonly optionalAiMatching: boolean;
}
