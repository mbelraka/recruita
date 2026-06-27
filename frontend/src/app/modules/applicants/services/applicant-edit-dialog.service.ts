import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { filter, take, tap } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { FullState } from '../../../models/full-state.model';
import { NEW_APPLICANT_DIALOG_UPDATE_FLAG } from '../constants/new-applicant-dialog.constants';
import { NewApplicantComponent } from '../components/new-applicant/new-applicant.component';
import { NewApplicantDialogCloseResult } from '../models/new-applicant-dialog-close-result.model';
import { NewApplicantDialogData } from '../models/new-applicant-dialog-data.model';
import { Applicant } from '../models/applicant.model';
import { ApplicantEntityCollectionService } from '../data/applicant-entity-collection.service';
import {
  addApplicant,
  applicantFormDialogClosed,
  updateApplicant,
} from '../state/applicants.actions';

@Injectable({ providedIn: 'root' })
export class ApplicantEditDialogService {
  public constructor(
    private readonly _applicants: ApplicantEntityCollectionService,
    private readonly _dialog: MatDialog,
    private readonly _store: Store<FullState>
  ) {}

  /** Opens create dialog, or loads detail then opens edit dialog. */
  public openCreateOrEdit(applicant: Applicant | undefined): void {
    if (!applicant) {
      this._openDialog(undefined);
      return;
    }

    this._applicants
      .getByKey(applicant.id)
      .pipe(take(1))
      .subscribe({
        next: (fullApplicant) => this._openDialog(fullApplicant),
        error: () => this._openDialog(applicant),
      });
  }

  private _openDialog(applicant: Applicant | undefined): void {
    this._dialog
      .open(NewApplicantComponent, {
        ...APP_CONFIG.DIALOG_CONFIG,
        ...(applicant
          ? { data: { applicant } satisfies NewApplicantDialogData }
          : {}),
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() =>
          this._store.dispatch(
            applicantFormDialogClosed({
              suppressPointerExpandUntil:
                performance.now() +
                APP_CONFIG.APPLICANTS
                  .NEW_APPLICANT_FAB_SUPPRESS_POINTER_EXPAND_AFTER_DIALOG_MS,
            })
          )
        ),
        filter(
          (result): result is NewApplicantDialogCloseResult => result != null
        )
      )
      .subscribe((result) => {
        if (this._isUpdateResult(result)) {
          this._store.dispatch(
            updateApplicant({ applicant: result.applicant })
          );
          return;
        }
        this._store.dispatch(addApplicant({ applicant: result }));
      });
  }

  private _isUpdateResult(result: NewApplicantDialogCloseResult): result is {
    applicant: Applicant;
    [NEW_APPLICANT_DIALOG_UPDATE_FLAG.KEY]: typeof NEW_APPLICANT_DIALOG_UPDATE_FLAG.VALUE;
  } {
    return (
      typeof result === 'object' &&
      result !== null &&
      NEW_APPLICANT_DIALOG_UPDATE_FLAG.KEY in result &&
      (result as Record<string, unknown>)[
        NEW_APPLICANT_DIALOG_UPDATE_FLAG.KEY
      ] === NEW_APPLICANT_DIALOG_UPDATE_FLAG.VALUE
    );
  }
}
