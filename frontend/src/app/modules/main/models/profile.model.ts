import { Languages } from '../../../enums/language.enum';

export interface Profile {
  readonly id: string;
  readonly privacyNoticeAccepted: boolean;
  readonly lastLanguage: Languages;
  readonly optionalRemoteTranslation: boolean;
  readonly optionalGeocoding: boolean;
  readonly optionalAiMatching: boolean;
}
