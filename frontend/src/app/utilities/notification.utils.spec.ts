import { Action } from '@ngrx/store';

import { AppNotificationType } from '../enums/app-notification-type.enum';
import { addApplicantFailure } from '../modules/applicants/state/applicants.actions';

import {
  concatWithErrorNotification,
  concatWithNotification,
  notificationPanelClasses,
} from './notification.utils';

describe('notification.utils', () => {
  it('builds panel classes from notification type', () => {
    expect(notificationPanelClasses(AppNotificationType.Success)).toEqual([
      'app-notification-snackbar',
      'app-notification-snackbar--success',
    ]);
  });

  it('concatWithNotification emits domain and showNotification actions', (done) => {
    const failure = addApplicantFailure({ error: 'offline' });
    concatWithNotification(failure, {
      type: AppNotificationType.Error,
      message: 'offline.',
    }).subscribe({
      next: (action) => {
        if (action.type === failure.type) {
          expect(action).toEqual(failure);
          return;
        }
        expect(action.type).toBe('[App] Show Notification');
        done();
      },
    });
  });

  it('concatWithErrorNotification uses fallback key when detail is empty', (done) => {
    const failure = addApplicantFailure({ error: 'x' });
    const seen: Action[] = [];
    concatWithErrorNotification(failure, undefined).subscribe({
      next: (action) => seen.push(action),
      complete: () => {
        expect(seen.length).toBe(2);
        expect(seen[0]).toEqual(failure);
        const notification = seen[1];
        expect(notification).toBeDefined();
        expect(notification!.type).toBe('[App] Show Notification');
        done();
      },
    });
  });

  it('concatWithErrorNotification uses detail text when provided', (done) => {
    const failure = addApplicantFailure({ error: 'x' });
    const seen: Action[] = [];
    concatWithErrorNotification(failure, 'create failed').subscribe({
      next: (action) => seen.push(action),
      complete: () => {
        expect(seen.length).toBe(2);
        expect(seen[0]).toEqual(failure);
        const notification = seen[1];
        expect(notification).toBeDefined();
        expect(notification!.type).toBe('[App] Show Notification');
        done();
      },
    });
  });
});
