/** `AppNotification` fields omitted from snack-bar payloads. */
export const APP_NOTIFICATION_SNACK_BAR_OMITTED_FIELD = {
  DURATION_MS: 'durationMs',
} as const;

export type AppNotificationSnackBarOmittedField =
  (typeof APP_NOTIFICATION_SNACK_BAR_OMITTED_FIELD)[keyof typeof APP_NOTIFICATION_SNACK_BAR_OMITTED_FIELD];
