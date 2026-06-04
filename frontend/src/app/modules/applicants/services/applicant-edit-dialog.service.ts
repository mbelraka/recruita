import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';

import { Store } from '@ngrx/store';
import { filter, tap } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { FullState } from '../../../models/full-state.model';
import { NEW_APPLICANT_DIALOG_UPDATE_FLAG } from '../constants/new-applicant-dialog.constants';
import { NewApplicantComponent } from '../components/new-applicant/new-applicant.component';
import { NewApplicantDialogCloseResult } from '../models/new-applicant-dialog-close-result.model';
import { NewApplicantDialogData } from '../models/new-applicant-dialog-data.model';
import { Applicant } from '../models/applicant.model';
import { ApplicantEntityCollectionService } from '../data/applicant-entity-collection.service';
import { addApplicant, updateApplicant } from '../state/applicants.actions';

@Injectable({ providedIn: 'root' })
export class ApplicantEditDialogService {
  public constructor(
    private readonly _applicants: ApplicantEntityCollectionService,
    private readonly _dialog: MatDialog,
    private readonly _store: Store<FullState>
  ) {}

  /** Opens create dialog, or loads detail then opens edit dialog. */
  public openCreateOrEdit(
    destroyRef: DestroyRef,
    applicant: Applicant | undefined,
    onDialogClosed: () => void
  ): void {
    if (!applicant) {
      this._openDialog(destroyRef, undefined, onDialogClosed);
      return;
    }

    this._applicants
      .getByKey(applicant.id)
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe({
        next: (fullApplicant) =>
          this._openDialog(destroyRef, fullApplicant, onDialogClosed),
        error: () => this._openDialog(destroyRef, applicant, onDialogClosed),
      });
  }

  private _openDialog(
    destroyRef: DestroyRef,
    applicant: Applicant | undefined,
    onDialogClosed: () => void
  ): void {
    this._dialog
      .open(NewApplicantComponent, {
        ...APP_CONFIG.DIALOG_CONFIG,
        ...(applicant
          ? { data: { applicant } satisfies NewApplicantDialogData }
          : {}),
      })
      .afterClosed()
      .pipe(
        takeUntilDestroyed(destroyRef),
        tap(onDialogClosed),
        filter((result): result is NewApplicantDialogCloseResult =>
          Boolean(result)
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
