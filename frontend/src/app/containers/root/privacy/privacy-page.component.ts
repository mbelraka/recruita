import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { PrivacyConsentDialogService } from './privacy-consent-dialog.service';
import { FullState } from '../../../models/full-state.model';
import { clearProfileState } from '../../../modules/main/state/profile.actions';
import { selectProfile } from '../../../modules/main/state/main.selectors';
import { PrivacyConsentService } from '../../../services/privacy-consent.service';
import { translateInstantString } from '../../../utilities/localization.utils';

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

  protected async exportSessionCopy(): Promise<void> {
    const profile = await firstValueFrom(this._store.select(selectProfile));
    const payload = await firstValueFrom(
      this._privacy.buildDataExportJson$(profile)
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `recruita-session-export-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  protected eraseSessionData(): void {
    const ok = globalThis.confirm(
      translateInstantString(this._translate, 'privacy.page.eraseConfirm')
    );
    if (ok) {
      this._store.dispatch(clearProfileState());
      this._privacy.eraseSessionDataAndReload();
    }
  }
}
