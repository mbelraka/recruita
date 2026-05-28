/** JSON shape returned by Spring `ProfileDto` (camelCase). */
export interface ProfileApiRecord {
  readonly id: string;
  readonly privacyNoticeAccepted: boolean;
  readonly lastLanguage: string;
  readonly optionalRemoteTranslation: boolean;
  readonly optionalGeocoding: boolean;
  readonly optionalAiMatching: boolean;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}
