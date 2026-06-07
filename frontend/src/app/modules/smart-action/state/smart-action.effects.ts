import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import {
  catchError,
  concatMap,
  exhaustMap,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';

import { SMART_ACTION_MESSAGES } from '../constants/smart-action-messages.constants';
import { FullState } from '../../../models/full-state.model';
import { getErrorMessage } from '../../../utilities/error.utils';
import { ParsedAction } from '../models/parsed-action.type';
import { mapParseActionResponse } from '../utilities/map-parse-action-response.util';
import { executeParsedAction } from '../utilities/execution/execute-parsed-action.util';
import { ActionLoggerService } from '../services/action-logger.service';
import { ActionParseApiService } from '../services/action-parse-api.service';
import {
  executeSmartAction,
  executeSmartActionFailure,
  executeSmartActionSuccess,
  parseSmartActionFailure,
  parseSmartActionSuccess,
  submitSmartActionCommand,
  undoSmartAction,
} from './smart-action.actions';
import { selectSmartActionResult } from './smart-action.selectors';

@Injectable()
export class SmartActionEffects {
  public readonly parseCommand$ = createEffect(() =>
    this._actions$.pipe(
      ofType(submitSmartActionCommand),
      exhaustMap(({ command }) =>
        this._parseApi.parseCommand(command).pipe(
          map((response) => {
            const action = mapParseActionResponse(response);
            if (!action) {
              return parseSmartActionFailure({
                errors:
                  response.errors.length > 0
                    ? response.errors
                    : [SMART_ACTION_MESSAGES.INVALID_PARSER_ACTION],
              });
            }
            return parseSmartActionSuccess({ action });
          }),
          catchError((error: unknown) =>
            of(
              parseSmartActionFailure({
                errors: [getErrorMessage(error)],
              })
            )
          )
        )
      )
    )
  );

  public readonly executeAfterParse$ = createEffect(() =>
    this._actions$.pipe(
      ofType(parseSmartActionSuccess),
      map(({ action }) => executeSmartAction({ action }))
    )
  );

  public readonly executeAction$ = createEffect(() =>
    this._actions$.pipe(
      ofType(executeSmartAction, undoSmartAction),
      concatMap((action) => this._runExecution$(action))
    )
  );

  public readonly logExecution$ = createEffect(
    () =>
      this._actions$.pipe(
        ofType(executeSmartActionSuccess),
        tap(({ action, result, durationMs }) =>
          this._logger.logAction(action, result, durationMs)
        )
      ),
    { dispatch: false }
  );

  public constructor(
    private readonly _actions$: Actions,
    private readonly _store: Store<FullState>,
    private readonly _router: Router,
    private readonly _parseApi: ActionParseApiService,
    private readonly _logger: ActionLoggerService
  ) {}

  private _runExecution$(
    trigger:
      | ReturnType<typeof executeSmartAction>
      | ReturnType<typeof undoSmartAction>
  ): Observable<Action> {
    const startedAt = performance.now();

    if (trigger.type === undoSmartAction.type) {
      return this._store.select(selectSmartActionResult).pipe(
        switchMap((result) => {
          if (!result?.undo) {
            return of(
              executeSmartActionFailure({
                message: SMART_ACTION_MESSAGES.NOTHING_TO_UNDO,
              })
            );
          }
          const undoAction = {
            type: result.undo.type,
            params: result.undo.params,
          } as ParsedAction;
          return executeParsedAction(undoAction, {
            store: this._store,
            router: this._router,
          }).pipe(
            map((executionResult) =>
              executeSmartActionSuccess({
                action: undoAction,
                result: executionResult,
                durationMs: performance.now() - startedAt,
              })
            ),
            catchError((error: unknown) =>
              of(executeSmartActionFailure({ message: getErrorMessage(error) }))
            )
          );
        })
      );
    }

    return executeParsedAction(trigger.action, {
      store: this._store,
      router: this._router,
    }).pipe(
      map((result) =>
        executeSmartActionSuccess({
          action: trigger.action,
          result,
          durationMs: performance.now() - startedAt,
        })
      ),
      catchError((error: unknown) =>
        of(executeSmartActionFailure({ message: getErrorMessage(error) }))
      )
    );
  }
}
