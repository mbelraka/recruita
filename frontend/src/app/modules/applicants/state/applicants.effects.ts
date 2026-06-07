import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom, mapResponse } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import {
  catchError,
  concatMap,
  exhaustMap,
  filter,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { NOTIFICATION_MESSAGE_KEYS } from '../../../constants/notification-message-keys';
import { AppNotificationType } from '../../../enums/app-notification-type.enum';
import { FullState } from '../../../models/full-state.model';
import { getErrorMessage } from '../../../utilities/error.utils';
import {
  concatWithErrorNotification,
  concatWithNotification,
} from '../../../utilities/notification.utils';
import { invalidateMatchResults } from '../../match/state/match.actions';
import { ApplicantEntityCollectionService } from '../data/applicant-entity-collection.service';
import { ApplicantEditDialogService } from '../services/applicant-edit-dialog.service';
import { CitySearchService } from '../services/city-search.service';
import {
  mergeApplicantListFilters,
  navigateApplicantFiltersUrl,
  parseApplicantFiltersFromQueryParams,
} from '../utilities/applicant-filters.util';
import {
  addApplicant,
  addApplicantFailure,
  addApplicantSuccess,
  applicantsRosterLoaded,
  deleteApplicant,
  deleteApplicantFailure,
  deleteApplicantSuccess,
  loadApplicants,
  loadApplicantsFailure,
  openApplicantForm,
  patchApplicantFilters,
  searchLocationSuggestions,
  searchLocationSuggestionsFailure,
  searchLocationSuggestionsSuccess,
  syncApplicantFiltersFromUrl,
  updateApplicant,
  updateApplicantFailure,
  updateApplicantSuccess,
} from './applicants.actions';
import {
  selectFilterByCountry,
  selectFilterBySkill,
  selectFilterByStatus,
  selectGlobalFilter,
} from './applicants.selectors';

/**
 * Flattening: switchMap cancels stale reads (list, geocode); exhaustMap ignores duplicate
 * mutations while one is in flight; concatMap chains mutation → notify.
 */
@Injectable()
export class ApplicantsEffects {
  public constructor(
    private readonly _actions$: Actions,
    private readonly _store: Store<FullState>,
    private readonly _router: Router,
    private readonly _applicants: ApplicantEntityCollectionService,
    private readonly _citySearchService: CitySearchService,
    private readonly _editDialog: ApplicantEditDialogService
  ) {}

  routerApplicantFiltersSync$ = createEffect(() =>
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      filter(() => this._router.url.startsWith(APP_CONFIG.ROUTES.APPLICANTS)),
      map(() => {
        let route = this._router.routerState.root;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return syncApplicantFiltersFromUrl({
          filters: parseApplicantFiltersFromQueryParams(
            route.snapshot.queryParamMap
          ),
        });
      })
    )
  );

  patchApplicantFilters$ = createEffect(
    () =>
      this._actions$.pipe(
        ofType(patchApplicantFilters),
        concatLatestFrom(() => [
          this._store.select(selectGlobalFilter),
          this._store.select(selectFilterBySkill),
          this._store.select(selectFilterByStatus),
          this._store.select(selectFilterByCountry),
        ]),
        tap(([{ partial }, globalFilter, skill, status, country]) => {
          void navigateApplicantFiltersUrl(
            this._router,
            mergeApplicantListFilters(
              { globalFilter, skill, status, country },
              partial
            )
          );
        })
      ),
    { dispatch: false }
  );

  openApplicantForm$ = createEffect(
    () =>
      this._actions$.pipe(
        ofType(openApplicantForm),
        tap(({ applicant }) => {
          this._editDialog.openCreateOrEdit(applicant);
        })
      ),
    { dispatch: false }
  );

  loadApplicants$ = createEffect(() =>
    this._actions$.pipe(
      ofType(loadApplicants),
      switchMap(() =>
        this._applicants.loadRoster().pipe(
          map(() => applicantsRosterLoaded()),
          catchError((error: unknown) =>
            of(loadApplicantsFailure({ error: getErrorMessage(error) }))
          )
        )
      )
    )
  );

  searchLocationSuggestions$ = createEffect(() =>
    this._actions$.pipe(
      ofType(searchLocationSuggestions),
      switchMap(({ query, language }) =>
        this._citySearchService.searchCityLabels(query, language).pipe(
          mapResponse({
            next: (suggestions) =>
              searchLocationSuggestionsSuccess({ suggestions }),
            error: () => searchLocationSuggestionsFailure(),
          })
        )
      )
    )
  );

  addApplicant$ = createEffect(() =>
    this._actions$.pipe(
      ofType(addApplicant),
      exhaustMap(({ applicant }) =>
        this._applicants.add(applicant).pipe(
          concatMap((created) =>
            concatWithNotification(
              addApplicantSuccess({ applicant: created }),
              {
                type: AppNotificationType.Success,
                messageKey: NOTIFICATION_MESSAGE_KEYS.applicantCreatedSuccess,
              }
            )
          ),
          catchError((error: unknown) => {
            const errMsg = getErrorMessage(error);
            return concatWithErrorNotification(
              addApplicantFailure({ error: errMsg }),
              errMsg
            );
          })
        )
      )
    )
  );

  updateApplicant$ = createEffect(() =>
    this._actions$.pipe(
      ofType(updateApplicant),
      exhaustMap(({ applicant }) =>
        this._applicants.update(applicant).pipe(
          concatMap((updated) =>
            concatWithNotification(
              updateApplicantSuccess({ applicant: updated }),
              {
                type: AppNotificationType.Success,
                messageKey: NOTIFICATION_MESSAGE_KEYS.applicantUpdatedSuccess,
              }
            )
          ),
          catchError((error: unknown) => {
            const errMsg = getErrorMessage(error);
            if (errMsg.toLowerCase().includes('not found')) {
              return concatWithErrorNotification(
                updateApplicantFailure({ error: errMsg }),
                undefined,
                NOTIFICATION_MESSAGE_KEYS.applicantNotFound
              );
            }
            return concatWithErrorNotification(
              updateApplicantFailure({ error: errMsg }),
              errMsg
            );
          })
        )
      )
    )
  );

  deleteApplicant$ = createEffect(() =>
    this._actions$.pipe(
      ofType(deleteApplicant),
      exhaustMap(({ id }) =>
        this._applicants.delete(id).pipe(
          concatMap(() =>
            concatWithNotification(deleteApplicantSuccess({ id }), {
              type: AppNotificationType.Info,
              messageKey: NOTIFICATION_MESSAGE_KEYS.applicantDeletedSuccess,
            })
          ),
          catchError((error: unknown) => {
            const errMsg = getErrorMessage(error);
            return concatWithErrorNotification(
              deleteApplicantFailure({ error: errMsg }),
              errMsg
            );
          })
        )
      )
    )
  );

  /** Drop stale AI match scores when the applicant roster changes. */
  invalidateMatchOnApplicantChange$ = createEffect(() =>
    this._actions$.pipe(
      ofType(
        addApplicantSuccess,
        updateApplicantSuccess,
        deleteApplicantSuccess
      ),
      map(() => invalidateMatchResults())
    )
  );
}
