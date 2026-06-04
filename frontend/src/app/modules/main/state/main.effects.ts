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
import { setLanguage } from '../../../state/app.actions';
import { selectAppLanguage } from '../../../state/app.selectors';
import { buildPrivacyConsentSaveRequest } from '../../../utilities/build-save-profile-request.util';
import { getErrorMessage } from '../../../utilities/error.utils';
import { isLanguage } from '../../../utilities/language.utils';
import {
  isPrivacyConsentDialogCloseResult,
  privacyChoicesFromDialogResult,
} from '../../../utilities/privacy-consent-dialog-outcome.util';

import { ProfileEntityCollectionService } from '../data/profile-entity-collection.service';
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
import { buildSaveProfileRequest } from '../../../utilities/build-save-profile-request.util';

/**
 * Flattening: switchMap cancels stale work; exhaustMap ignores duplicates while busy;
 * concatMap runs ordered steps (optimistic update → API, or success → language restore).
 */
@Injectable()
export class MainEffects {
  public constructor(
    private readonly _actions$: Actions,
    private readonly _profiles: ProfileEntityCollectionService,
    private readonly _privacyDialog: PrivacyConsentDialogService,
    private readonly _store: Store<FullState>
  ) {}

  loadProfile$ = createEffect(() =>
    this._actions$.pipe(
      ofType(loadProfile),
      switchMap(() =>
        this._profiles.getByKey(APP_CONFIG.PROFILE.DEFAULT_ID).pipe(
          tap(() => {
            this._profiles.setLoaded(true);
            this._profiles.setLoading(false);
          }),
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
      exhaustMap(({ result }) => {
        if (!isPrivacyConsentDialogCloseResult(result)) {
          return EMPTY;
        }

        const choices = privacyChoicesFromDialogResult(result);

        return this._store.select(selectProfile).pipe(
          take(1),
          withLatestFrom(this._store.select(selectAppLanguage)),
          concatMap(([profile, language]) => {
            const request = buildPrivacyConsentSaveRequest(
              profile,
              language,
              choices
            );
            this._profiles.upsertOptimisticFromRequest(request);

            return this._profiles.save(request, profile).pipe(
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
            );
          })
        );
      })
    )
  );

  persistLastLanguage$ = createEffect(() =>
    this._actions$.pipe(
      ofType(setLanguage),
      switchMap(({ language }) =>
        this._store.select(selectProfileLoaded).pipe(
          filter((loaded) => loaded),
          take(1),
          withLatestFrom(this._store.select(selectProfile)),
          concatMap(([, profile]) => {
            if (profile?.lastLanguage === language) {
              return EMPTY;
            }

            return this._profiles
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
