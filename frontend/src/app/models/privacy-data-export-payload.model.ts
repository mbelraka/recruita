import { Languages } from '../enums/language.enum';
import { Applicant } from '../modules/applicants/models/applicant.model';
import type { Profile } from '../modules/main/models/profile.model';

export interface PrivacyDataExportPayload {
  readonly exportedAt: string;
  readonly note: string;
  readonly profile: Profile | null;
  readonly applicants: readonly Applicant[];
  readonly language: Languages;
  readonly privacyConsentVersion: number | null;
}
