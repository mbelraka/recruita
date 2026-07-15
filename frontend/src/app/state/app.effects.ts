import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router } from '@angular/router';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { filter, map, tap } from 'rxjs';

import { APP_CONFIG } from '../config/app.config';
import { NotificationSnackBarComponent } from '../components/notification-snack-bar/notification-snack-bar.component';
import { RouteFocusService } from '../services/route-focus.service';
import { notificationPanelClasses } from '../utilities/notification.utils';
import { clearNotification, showNotification } from './app.actions';

@Injectable()
export class AppEffects {
  /** WCAG 2.4.3 — focus main landmark after route changes (handled in effects, not components). */
  public focusMainContentOnNavigate$ = createEffect(
    () =>
      this._router.events.pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        tap(() => this._routeFocus.focusMainContent())
      ),
    { dispatch: false }
  );

  /** Opens the snackbar and clears notification state; one subscription per notification. */
  public showNotification$ = createEffect(() =>
    this._actions$.pipe(
      ofType(showNotification),
      tap(({ notification }) => {
        const { durationMs, ...snackBarData } = notification;
        const snack = APP_CONFIG.NOTIFICATION.SNACKBAR;
        this._snackBar.openFromComponent(NotificationSnackBarComponent, {
          data: snackBarData,
          duration: durationMs ?? snack.DEFAULT_DURATION_MS,
          horizontalPosition: snack.HORIZONTAL_POSITION,
          verticalPosition: snack.VERTICAL_POSITION,
          panelClass: notificationPanelClasses(notification.type),
        });
      }),
      map(() => clearNotification())
    )
  );

  constructor(
    private readonly _actions$: Actions,
    private readonly _snackBar: MatSnackBar,
    private readonly _router: Router,
    private readonly _routeFocus: RouteFocusService
  ) {}
}
