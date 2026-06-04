import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import {
  catchError,
  combineLatest,
  concatMap,
  filter,
  map,
  Observable,
  switchMap,
  take,
  timeout,
} from 'rxjs';

import { NOTIFICATION_MESSAGE_KEYS } from '../../../constants/notification-message-keys';
import { APP_CONFIG } from '../../../config/app.config';
import { AppNotificationType } from '../../../enums/app-notification-type.enum';
import { FullState } from '../../../models/full-state.model';
import { selectAppLanguage } from '../../../state/app.selectors';
import { getErrorMessage } from '../../../utilities/error.utils';
import {
  concatWithErrorNotification,
  concatWithNotification,
} from '../../../utilities/notification.utils';
import {
  selectAllApplicants,
  selectApplicantsReady,
} from '../../applicants/state/applicants.selectors';
import { Applicant } from '../../applicants/models/applicant.model';
import { Languages } from '../../../enums/language.enum';
import { MatchCandidatesService } from '../services/match-candidates.service';
import {
  evaluateCandidates,
  evaluateCandidatesFailure,
  evaluateCandidatesSuccess,
} from './match.actions';
import {
  selectMatchJobDescription,
  selectTopCandidatesCount,
} from './match.selectors';

interface MatchEvaluationInputs {
  readonly jobDescription: string;
  readonly applicants: readonly Applicant[];
  readonly topCandidatesCount: number;
  readonly language: Languages;
}

/**
 * Flattening: switchMap cancels an in-flight evaluation; concatMap waits for applicants,
 * snapshots inputs, and runs the HTTP call in order.
 */
@Injectable()
export class MatchEffects {
  public readonly evaluateCandidates$ = createEffect(() =>
    this._actions$.pipe(
      ofType(evaluateCandidates),
      // Latest evaluate action wins — cancel a stale in-flight match request.
      switchMap(() => this._evaluateAfterInputsReady$())
    )
  );

  public constructor(
    private readonly _actions$: Actions,
    private readonly _store: Store<FullState>,
    private readonly _matchCandidatesService: MatchCandidatesService
  ) {}

  private _evaluateAfterInputsReady$(): Observable<Action> {
    return combineLatest([
      this._store.select(selectApplicantsReady),
      this._store.select(selectAllApplicants),
    ]).pipe(
      filter(([ready, applicants]) => ready || applicants.length > 0),
      take(1),
      concatMap(() => this._snapshotEvaluationInputs$()),
      concatMap((inputs) => this._runEvaluation$(inputs)),
      catchError((error: unknown) => this._matchEvaluationError$(error))
    );
  }

  private _snapshotEvaluationInputs$(): Observable<MatchEvaluationInputs> {
    return combineLatest([
      this._store.select(selectMatchJobDescription).pipe(take(1)),
      this._store.select(selectAllApplicants).pipe(take(1)),
      this._store.select(selectTopCandidatesCount).pipe(take(1)),
      this._store.select(selectAppLanguage).pipe(take(1)),
    ]).pipe(
      map(([jobDescription, applicants, topCandidatesCount, language]) => ({
        jobDescription,
        applicants,
        topCandidatesCount,
        language,
      }))
    );
  }

  private _runEvaluation$(inputs: MatchEvaluationInputs): Observable<Action> {
    const { REQUEST_TIMEOUT_MS, EFFECT_TIMEOUT_GRACE_MS } = APP_CONFIG.MATCH;

    return this._matchCandidatesService
      .evaluate(
        inputs.jobDescription,
        [...inputs.applicants],
        inputs.topCandidatesCount,
        inputs.language
      )
      .pipe(
        timeout({ first: REQUEST_TIMEOUT_MS + EFFECT_TIMEOUT_GRACE_MS }),
        concatMap((results) =>
          concatWithNotification(evaluateCandidatesSuccess({ results }), {
            type: AppNotificationType.Info,
            messageKey: NOTIFICATION_MESSAGE_KEYS.matchCompleted,
            messageParams: { count: results.length },
          })
        ),
        catchError((error: unknown) => this._matchEvaluationError$(error))
      );
  }

  private _matchEvaluationError$(error: unknown): Observable<Action> {
    const msg = getErrorMessage(error);
    return concatWithErrorNotification(
      evaluateCandidatesFailure({ error: msg }),
      msg,
      NOTIFICATION_MESSAGE_KEYS.matchEvaluationFailed
    );
  }
}
