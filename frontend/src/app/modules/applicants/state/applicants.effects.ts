import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap } from 'rxjs';

import { NOTIFICATION_MESSAGE_KEYS } from '../../../constants/notification-message-keys';
import { AppNotificationType } from '../../../enums/app-notification-type.enum';
import { getErrorMessage } from '../../../utilities/error.utils';
import {
  concatWithErrorNotification,
  concatWithNotification,
} from '../../../utilities/notification.utils';
import { ApplicantApiService } from '../services/applicant-api.service';
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
  loadApplicantsSuccess,
  searchLocationSuggestions,
  searchLocationSuggestionsFailure,
  searchLocationSuggestionsSuccess,
} from './applicants.actions';

@Injectable()
export class ApplicantsEffects {
  public constructor(
    private readonly _actions$: Actions,
    private readonly _applicantApi: ApplicantApiService,
    private readonly _citySearchService: CitySearchService
  ) {}

  loadApplicants$ = createEffect(() =>
    this._actions$.pipe(
      ofType(loadApplicants),
      switchMap(() =>
        this._applicantApi.list().pipe(
          map((applicants) => loadApplicantsSuccess({ applicants })),
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
          map((suggestions) =>
            searchLocationSuggestionsSuccess({ suggestions })
          ),
          catchError(() => of(searchLocationSuggestionsFailure()))
        )
      )
    )
  );

  addApplicant$ = createEffect(() =>
    this._actions$.pipe(
      ofType(addApplicant),
      exhaustMap(({ applicant }) =>
        this._applicantApi.create(applicant).pipe(
          switchMap(() => this._applicantApi.list()),
          switchMap((applicants) =>
            concatWithNotification(addApplicantSuccess({ applicants }), {
              type: AppNotificationType.Success,
              messageKey: NOTIFICATION_MESSAGE_KEYS.applicantCreatedSuccess,
            })
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
        this._applicantApi.update(applicant).pipe(
          switchMap(() => this._applicantApi.list()),
          switchMap((applicants) =>
            concatWithNotification(updateApplicantSuccess({ applicants }), {
              type: AppNotificationType.Success,
              messageKey: NOTIFICATION_MESSAGE_KEYS.applicantUpdatedSuccess,
            })
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
        this._applicantApi.delete(id).pipe(
          switchMap(() => this._applicantApi.list()),
          switchMap((applicants) =>
            concatWithNotification(deleteApplicantSuccess({ applicants }), {
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
}
