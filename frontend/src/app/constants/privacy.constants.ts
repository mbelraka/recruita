/** Bump when persisted consent schema or policy materially changes (stored record shape). */
export const PRIVACY_CONSENT_VERSION = 1;

/** Shown inline in downloadable JSON exports (not localized by design — legal/audit clarity). */
export const PRIVACY_DATA_EXPORT_NOTE =
  'JSON export of applicant data loaded in this session plus current consent choices. Does not include server logs.';

/** SPA base path after resetting the session (Angular `base href` default). */
export const PRIVACY_POST_ERASE_APP_PATH = '/';

/** Persisted on the admin profile when the user completes a consent dialog flow. */
export const PRIVACY_NOTICE_ACCEPTED = true as const;

/** MatDialog panel options for the consent gate / editor. */
export const PRIVACY_CONSENT_DIALOG_PANEL = {
  disableClose: true,
  width: 'min(560px, 94vw)',
} as const;
