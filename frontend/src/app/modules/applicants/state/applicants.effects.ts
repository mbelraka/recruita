import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mapResponse } from '@ngrx/operators';
import { catchError, concatMap, exhaustMap, map, of, switchMap } from 'rxjs';

import { NOTIFICATION_MESSAGE_KEYS } from '../../../constants/notification-message-keys';
import { AppNotificationType } from '../../../enums/app-notification-type.enum';
import { getErrorMessage } from '../../../utilities/error.utils';
import {
  concatWithErrorNotification,
  concatWithNotification,
} from '../../../utilities/notification.utils';
import { invalidateMatchResults } from '../../match/state/match.actions';
import { ApplicantEntityCollectionService } from '../data/applicant-entity-collection.service';
import { CitySearchService } from '../services/city-search.service';
import {
  addApplicant,
  addApplicantFailure,
  addApplicantSuccess,
  updateApplicant,
  updateApplicantFailure,
  updateApplicantSuccess,
  deleteApplicant,
  deleteApplicantFailure,
  deleteApplicantSuccess,
  loadApplicants,
  loadApplicantsFailure,
  applicantsRosterLoaded,
  searchLocationSuggestions,
  searchLocationSuggestionsFailure,
  searchLocationSuggestionsSuccess,
} from './applicants.actions';

/**
 * Flattening: switchMap cancels stale reads (list, geocode); exhaustMap ignores duplicate
 * mutations while one is in flight; concatMap chains mutation → notify.
 */
@Injectable()
export class ApplicantsEffects {
  public constructor(
    private readonly _actions$: Actions,
    private readonly _applicants: ApplicantEntityCollectionService,
    private readonly _citySearchService: CitySearchService
  ) {}

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
