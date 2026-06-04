import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { catchError, concatMap, exhaustMap, from, Observable } from 'rxjs';

import { NOTIFICATION_MESSAGE_KEYS } from '../../../constants/notification-message-keys';
import { AppNotificationType } from '../../../enums/app-notification-type.enum';
import { ExportService } from '../services/export.service';
import {
  concatWithErrorNotification,
  concatWithNotification,
} from '../../../utilities/notification.utils';
import { getErrorMessage } from '../../../utilities/error.utils';
import { ApplicantEntityCollectionService } from '../../applicants/data/applicant-entity-collection.service';
import {
  exportApplicants,
  exportFailure,
  exportSuccess,
} from './export.actions';
import { ExportFormats } from '../enums/export-formats.enum';

/**
 * Flattening: exhaustMap ignores duplicate export clicks; concatMap refreshes full
 * applicant data from the API before generating the file.
 */
@Injectable()
export class ExportEffects {
  public exportApplicants$ = createEffect(() =>
    this._actions$.pipe(
      ofType(exportApplicants),
      exhaustMap(({ format }) =>
        this._applicants.loadFull().pipe(
          concatMap(() =>
            from(this._triggerExport(format)).pipe(
              concatMap(() =>
                concatWithNotification(exportSuccess(), {
                  type: AppNotificationType.Success,
                  messageKey: NOTIFICATION_MESSAGE_KEYS.exportSuccess,
                })
              ),
              catchError((error: unknown) => this._exportFailure$(error))
            )
          ),
          catchError((error: unknown) => this._exportFailure$(error))
        )
      )
    )
  );

  public constructor(
    private readonly _actions$: Actions,
    private readonly _applicants: ApplicantEntityCollectionService,
    private readonly _exportService: ExportService
  ) {}

  private _exportFailure$(error: unknown): Observable<Action> {
    const errMsg = getErrorMessage(error);
    return concatWithErrorNotification(
      exportFailure({ error: errMsg }),
      errMsg,
      NOTIFICATION_MESSAGE_KEYS.exportFailed
    );
  }

  private _getExportHandler(
    format: ExportFormats
  ): (() => Promise<void>) | null {
    const handlers: Record<ExportFormats, () => Promise<void>> = {
      [ExportFormats.CSV]: () => this._exportService.exportAsCSV(),
      [ExportFormats.JSON]: () => this._exportService.exportAsJSON(),
      [ExportFormats.EXCEL]: () => this._exportService.exportAsExcel(),
      [ExportFormats.PDF]: () => this._exportService.exportAsPDF(),
    };
    return handlers[format] ?? null;
  }

  private async _triggerExport(format: ExportFormats): Promise<void> {
    const handler = this._getExportHandler(format);
    if (!handler) {
      throw new Error('Unsupported export format');
    }
    return handler();
  }
}
