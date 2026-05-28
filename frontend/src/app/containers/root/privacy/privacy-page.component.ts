import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';

import { PrivacyConsentDialogService } from './privacy-consent-dialog.service';
import { FullState } from '../../../models/full-state.model';
import { clearProfileState } from '../../../modules/main/state/profile.actions';
import { selectProfile } from '../../../modules/main/state/main.selectors';
import { PrivacyConsentService } from '../../../services/privacy-consent.service';

@Component({
  selector: 'app-privacy-page',
  standalone: true,
  imports: [MatButtonModule, RouterLink, TranslateModule],
  templateUrl: './privacy-page.component.html',
  styleUrl: './privacy-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPageComponent {
  private readonly _privacy = inject(PrivacyConsentService);
  private readonly _privacyDialog = inject(PrivacyConsentDialogService);
  private readonly _store = inject(Store<FullState>);
  private readonly _translate = inject(TranslateService);

  protected openConsentEditor(): void {
    this._privacyDialog.openConsentEditor();
  }

  protected exportSessionCopy(): void {
    this._store
      .select(selectProfile)
      .pipe(take(1))
      .subscribe((profile) => {
        this._privacy
          .buildDataExportJson$(profile)
          .pipe(take(1))
          .subscribe((payload) => {
            const blob = new Blob([payload], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `recruita-session-export-${Date.now()}.json`;
            anchor.click();
            URL.revokeObjectURL(url);
          });
      });
  }

  protected eraseSessionData(): void {
    const ok = window.confirm(
      this._translate.instant('privacy.page.eraseConfirm')
    );
    if (ok) {
      this._store.dispatch(clearProfileState());
      this._privacy.eraseSessionDataAndReload();
    }
  }
}
