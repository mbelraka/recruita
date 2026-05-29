import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Store } from '@ngrx/store';
import { take } from 'rxjs';

import { PRIVACY_CONSENT_DIALOG_PANEL } from '../../../constants/privacy.constants';
import { FullState } from '../../../models/full-state.model';
import { PrivacyConsentService } from '../../../services/privacy-consent.service';
import { isPrivacyConsentDialogCloseResult } from '../../../utilities/privacy-consent-dialog-outcome.util';
import { persistPrivacyConsentOutcome } from '../../../modules/main/state/profile.actions';

import { PrivacyConsentDialogComponent } from './privacy-consent-dialog.component';

/** Opens the consent dialog with shared wiring (DRY) — UI shell concern, colocated with the dialog component. */
@Injectable({ providedIn: 'root' })
export class PrivacyConsentDialogService {
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
      ...PRIVACY_CONSENT_DIALOG_PANEL,
      data: {
        initialChoices: this._privacy.formStateFromSnapshot(),
      },
    });

    ref
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (isPrivacyConsentDialogCloseResult(result)) {
          this._store.dispatch(persistPrivacyConsentOutcome({ result }));
        }
      });
  }
}
