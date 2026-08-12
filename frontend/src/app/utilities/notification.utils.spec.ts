import { Action } from '@ngrx/store';

import { APP_CONFIG } from '../config/app.config';
import { AppActionTypes } from '../enums/app-action-types.enum';
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
      APP_CONFIG.NOTIFICATION.SNACKBAR.PANEL_CLASS_BASE,
      `${APP_CONFIG.NOTIFICATION.SNACKBAR.PANEL_CLASS_BASE}--${AppNotificationType.Success}`,
    ]);
  });

  it('concatWithNotification emits domain and showNotification actions', (done) => {
    const failure = addApplicantFailure({ error: 'offline' });
    const seen: Action[] = [];
    concatWithNotification(failure, {
      type: AppNotificationType.Error,
      message: 'offline.',
    }).subscribe({
      next: (action) => seen.push(action),
      complete: () => {
        expect(seen).toEqual([
          failure,
          jasmine.objectContaining({ type: AppActionTypes.ShowNotification }),
        ]);
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
        expect(notification!.type).toBe(AppActionTypes.ShowNotification);
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
        expect(notification!.type).toBe(AppActionTypes.ShowNotification);
        done();
      },
    });
  });
});
