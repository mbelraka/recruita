import { Action } from '@ngrx/store';
import { concat, Observable, of } from 'rxjs';

import { APP_CONFIG } from '../config/app.config';
import { NOTIFICATION_MESSAGE_KEYS } from '../constants/notification-message-keys';
import { AppNotificationType } from '../enums/app-notification-type.enum';
import { AppNotification } from '../models/app-notification.model';
import { NotifyPayload } from '../models/notify-payload.model';
import { showNotification } from '../state/app.actions';

const { SNACKBAR } = APP_CONFIG.NOTIFICATION;

function stripTrailingPeriod(text: string): string {
  return text.replace(/\.\s*$/, '').trimEnd();
}

export function notificationPanelClasses(type: AppNotificationType): string[] {
  const base = SNACKBAR.PANEL_CLASS_BASE;
  return [base, `${base}--${type}`];
}

function toAppNotification(payload: NotifyPayload): AppNotification {
  const { type, useErrorDuration, messageKey, messageParams, message } =
    payload;

  let next: AppNotification;

  if (messageKey !== undefined) {
    next =
      messageParams === undefined
        ? { type, messageKey }
        : { type, messageKey, messageParams };
  } else if (message === undefined) {
    throw new Error('NotifyPayload requires messageKey or message');
  } else {
    next = { type, message: stripTrailingPeriod(message) };
  }

  if (!useErrorDuration) {
    return next;
  }
  return {
    ...next,
    durationMs: SNACKBAR.ERROR_DURATION_MS,
  };
}

/** Emits the domain action, then `showNotification`. */
export function concatWithNotification(
  domain: Action,
  notify: NotifyPayload
): Observable<Action> {
  return concat(
    of(domain),
    of(showNotification({ notification: toAppNotification(notify) }))
  );
}

/** Error toast: localized `fallbackMessageKey` when `detail` is empty; otherwise raw `detail` (trimmed) */
export function concatWithErrorNotification(
  failure: Action,
  detail: string | undefined,
  fallbackMessageKey: string = NOTIFICATION_MESSAGE_KEYS.applicantTransactionFailed
): Observable<Action> {
  return concatWithNotification(failure, {
    type: AppNotificationType.Error,
    ...(detail ? { message: detail } : { messageKey: fallbackMessageKey }),
    useErrorDuration: true,
  });
}
