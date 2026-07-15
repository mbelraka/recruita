import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { FullState } from 'src/app/models/full-state.model';
import {
  erasePrivacySessionData,
  exportPrivacySessionData,
  openPrivacyConsentEditor,
} from 'src/app/modules/main/state/profile.actions';
import { translateInstantString } from 'src/app/utilities/localization.utils';

@Component({
  selector: 'app-privacy-page',
  standalone: true,
  imports: [MatButtonModule, RouterLink, TranslateModule],
  templateUrl: './privacy-page.component.html',
  styleUrl: './privacy-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPageComponent {
  private readonly _store = inject(Store<FullState>);
  private readonly _translate = inject(TranslateService);

  protected openConsentEditor(): void {
    this._store.dispatch(openPrivacyConsentEditor());
  }

  protected exportSessionCopy(): void {
    this._store.dispatch(exportPrivacySessionData());
  }

  protected eraseSessionData(): void {
    const ok = globalThis.confirm(
      translateInstantString(this._translate, 'privacy.page.eraseConfirm')
    );
    if (ok) {
      this._store.dispatch(erasePrivacySessionData());
    }
  }
}
