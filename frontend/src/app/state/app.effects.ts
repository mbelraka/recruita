import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router } from '@angular/router';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, filter, map, mergeMap, tap } from 'rxjs';

import { APP_CONFIG } from '../config/app.config';
import { NotificationSnackBarComponent } from '../components/notification-snack-bar/notification-snack-bar.component';
import { FullState } from '../models/full-state.model';
import { selectOptionalRemoteTranslation } from '../modules/main/state/main.selectors';
import { RouteFocusService } from '../services/route-focus.service';
import { RemoteTranslateService } from '../services/remote-translate.service';
import { notificationPanelClasses } from '../utilities/notification.utils';
import { buildRemoteTranslationCacheKey } from '../utilities/remote-translate-cache.util';
import {
  clearNotification,
  clearRemoteTranslations,
  remoteTranslationSuccess,
  requestRemoteTranslation,
  showNotification,
} from './app.actions';

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

  public requestRemoteTranslation$ = createEffect(() =>
    this._actions$.pipe(
      ofType(requestRemoteTranslation),
      concatLatestFrom(() =>
        this._store.select(selectOptionalRemoteTranslation)
      ),
      mergeMap(([{ text, from, to }, allowed]) => {
        const key = buildRemoteTranslationCacheKey(from, to, text);
        if (!allowed) {
          return [remoteTranslationSuccess({ key, translated: text })];
        }
        return this._remoteTranslate
          .translate(text, from, to)
          .pipe(
            map((translated) => remoteTranslationSuccess({ key, translated }))
          );
      })
    )
  );

  public clearRemoteTranslationsWhenConsentOff$ = createEffect(() =>
    this._store.select(selectOptionalRemoteTranslation).pipe(
      distinctUntilChanged(),
      filter((enabled) => !enabled),
      map(() => clearRemoteTranslations())
    )
  );

  constructor(
    private readonly _actions$: Actions,
    private readonly _snackBar: MatSnackBar,
    private readonly _router: Router,
    private readonly _routeFocus: RouteFocusService,
    private readonly _store: Store<FullState>,
    private readonly _remoteTranslate: RemoteTranslateService
  ) {}
}
