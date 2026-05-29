import type { AppNotification } from '../../../models/app-notification.model';
import { AppNotificationSnackBarOmittedField } from '../../../constants/app-notification-field.constants';

export type NotificationSnackBarData = Omit<
  AppNotification,
  AppNotificationSnackBarOmittedField
>;
