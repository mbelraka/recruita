import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, from, mergeMap, switchMap } from 'rxjs';

import { NOTIFICATION_MESSAGE_KEYS } from '../../../constants/notification-message-keys';
import { AppNotificationType } from '../../../enums/app-notification-type.enum';
import { ExportService } from '../services/export.service';
import {
  concatWithErrorNotification,
  concatWithNotification,
} from '../../../utilities/notification.utils';
import { getErrorMessage } from '../../../utilities/error.utils';
import {
  exportApplicants,
  exportFailure,
  exportSuccess,
} from './export.actions';
import { ExportFormats } from '../enums/export-formats.enum';

@Injectable()
export class ExportEffects {
  public exportApplicants$ = createEffect(() =>
    this._actions$.pipe(
      ofType(exportApplicants),
      switchMap(({ format }) =>
        from(this._triggerExport(format)).pipe(
          mergeMap(() =>
            concatWithNotification(exportSuccess(), {
              type: AppNotificationType.Success,
              messageKey: NOTIFICATION_MESSAGE_KEYS.exportSuccess,
            })
          ),
          catchError((error: unknown) => {
            const errMsg = getErrorMessage(error);
            return concatWithErrorNotification(
              exportFailure({ error: errMsg }),
              errMsg,
              NOTIFICATION_MESSAGE_KEYS.exportFailed
            );
          })
        )
      )
    )
  );

  public constructor(
    private readonly _actions$: Actions,
    private readonly _exportService: ExportService
  ) {}

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
