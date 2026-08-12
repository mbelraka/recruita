import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { FullState } from '../../../models/full-state.model';
import { Applicant } from '../models/applicant.model';
import { confirmDeleteApplicant } from '../utilities/confirm-delete.util';

@Injectable({ providedIn: 'root' })
export class ConfirmDeleteApplicantDialogService {
  public constructor(
    private readonly _dialog: MatDialog,
    private readonly _store: Store<FullState>
  ) {}

  public open(applicant: Applicant): void {
    confirmDeleteApplicant(this._dialog, this._store, applicant);
  }
}
