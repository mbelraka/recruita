import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  catchError,
  concat,
  concatMap,
  EMPTY,
  exhaustMap,
  filter,
  map,
  of,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs';

import { PrivacyConsentDialogService } from '../../../containers/root/privacy/privacy-consent-dialog.service';
import { APP_CONFIG } from '../../../config/app.config';
import { FullState } from '../../../models/full-state.model';
import { ProfileApiService } from '../../../services/profile-api.service';
import { setLanguage } from '../../../state/app.actions';
import { selectAppLanguage } from '../../../state/app.selectors';
import {
  buildPrivacyConsentSaveRequest,
  buildSaveProfileRequest,
  profileFromSaveRequest,
} from '../../../utilities/build-save-profile-request.util';
import { getErrorMessage } from '../../../utilities/error.utils';
import { isLanguage } from '../../../utilities/language.utils';
import {
  isPrivacyConsentDialogCloseResult,
  privacyChoicesFromDialogResult,
} from '../../../utilities/privacy-consent-dialog-outcome.util';

import {
  loadProfile,
  loadProfileFailure,
  loadProfileSuccess,
  persistPrivacyConsentOutcome,
  persistPrivacyConsentOutcomeFailure,
  persistPrivacyConsentOutcomeSuccess,
  profileUpdated,
} from './profile.actions';
import { selectProfile, selectProfileLoaded } from './main.selectors';

/**
 * Flattening: switchMap cancels stale work; exhaustMap ignores duplicates while busy;
 * concatMap runs ordered steps (optimistic update → API, or success → language restore).
 */
@Injectable()
export class MainEffects {
  public constructor(
    private readonly _actions$: Actions,
    private readonly _api: ProfileApiService,
    private readonly _privacyDialog: PrivacyConsentDialogService,
    private readonly _store: Store<FullState>
  ) {}

  loadProfile$ = createEffect(() =>
    this._actions$.pipe(
      ofType(loadProfile),
      // Latest reload wins — cancel an in-flight fetch when loadProfile fires again.
      switchMap(() =>
        this._api.getById(APP_CONFIG.PROFILE.DEFAULT_ID).pipe(
          // Dispatch success, then language restore, in order.
          concatMap((profile) =>
            concat(
              of(loadProfileSuccess({ profile })),
              isLanguage(profile.lastLanguage)
                ? of(setLanguage({ language: profile.lastLanguage }))
                : EMPTY
            )
          ),
          catchError((error: unknown) =>
            of(loadProfileFailure({ error: getErrorMessage(error) }))
          )
        )
      )
    )
  );

  openPrivacyGateAfterProfileLoad$ = createEffect(
    () =>
      this._actions$.pipe(
        ofType(loadProfileSuccess, loadProfileFailure),
        tap(() => this._privacyDialog.openConsentDialogIfRequired())
      ),
    { dispatch: false }
  );

  persistPrivacyConsentOutcome$ = createEffect(() =>
    this._actions$.pipe(
      ofType(persistPrivacyConsentOutcome),
      // Ignore duplicate dialog outcomes while a save is already running.
      exhaustMap(({ result }) => {
        if (!isPrivacyConsentDialogCloseResult(result)) {
          return EMPTY;
        }

        const choices = privacyChoicesFromDialogResult(result);

        return this._store.select(selectProfile).pipe(
          take(1),
          withLatestFrom(this._store.select(selectAppLanguage)),
          // Optimistic store update, then persist to API, strictly ordered.
          concatMap(([profile, language]) => {
            const request = buildPrivacyConsentSaveRequest(
              profile,
              language,
              choices
            );
            const optimisticProfile = profileFromSaveRequest(request);

            return concat(
              of(profileUpdated({ profile: optimisticProfile })),
              this._api.save(request, profile).pipe(
                map((saved) =>
                  persistPrivacyConsentOutcomeSuccess({ profile: saved })
                ),
                catchError((error: unknown) =>
                  concat(
                    of(loadProfile()),
                    of(
                      persistPrivacyConsentOutcomeFailure({
                        error: getErrorMessage(error),
                      })
                    )
                  )
                )
              )
            );
          })
        );
      })
    )
  );

  persistLastLanguage$ = createEffect(() =>
    this._actions$.pipe(
      ofType(setLanguage),
      // Latest language selection wins — including profile restore after load.
      switchMap(({ language }) =>
        this._store.select(selectProfileLoaded).pipe(
          filter((loaded) => loaded),
          take(1),
          withLatestFrom(this._store.select(selectProfile)),
          concatMap(([, profile]) => {
            if (profile?.lastLanguage === language) {
              return EMPTY;
            }

            return this._api
              .save(
                buildSaveProfileRequest(profile, { lastLanguage: language }),
                profile
              )
              .pipe(
                map((saved) => profileUpdated({ profile: saved })),
                catchError(() => EMPTY)
              );
          })
        )
      )
    )
  );
}
