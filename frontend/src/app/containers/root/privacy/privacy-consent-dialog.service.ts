import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Store } from '@ngrx/store';
import { take } from 'rxjs';

import { FullState } from '../../../models/full-state.model';
import { PrivacyConsentService } from '../../../services/privacy-consent.service';
import { persistPrivacyConsentOutcome } from '../../../modules/main/state/profile.actions';

import { PrivacyConsentDialogComponent } from './privacy-consent-dialog.component';

/** Opens the consent dialog with shared wiring (DRY) — UI shell concern, colocated with the dialog component. */
@Injectable({ providedIn: 'root' })
export class PrivacyConsentDialogService {
  private static readonly _panel = {
    disableClose: true,
    width: 'min(560px, 94vw)',
  } as const;

  public constructor(
    private readonly _dialog: MatDialog,
    private readonly _privacy: PrivacyConsentService,
    private readonly _store: Store<FullState>
  ) {}

  /**
   * Gate: shows the modal only when consent is incomplete or stale.
   */
  public openConsentDialogIfRequired(): void {
    if (this._privacy.isConsentCompleteAndCurrent()) {
      return;
    }
    this.openConsentEditorCore();
  }

  /** Re-open preferences (privacy page — “Change consent”). */
  public openConsentEditor(): void {
    this.openConsentEditorCore();
  }

  private openConsentEditorCore(): void {
    const ref = this._dialog.open(PrivacyConsentDialogComponent, {
      ...PrivacyConsentDialogService._panel,
      data: {
        initialChoices: this._privacy.formStateFromSnapshot(),
      },
    });

    ref
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        this._store.dispatch(persistPrivacyConsentOutcome({ result }));
      });
  }
}
