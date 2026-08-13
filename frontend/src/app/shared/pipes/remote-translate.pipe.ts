import { ChangeDetectorRef, inject, Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngrx/store';

import { APP_CONFIG } from '../../config/app.config';
import { Languages } from '../../enums/language.enum';
import { FullState } from '../../models/full-state.model';
import { requestRemoteTranslation } from '../../state/app.actions';
import {
  selectRemoteTranslationInFlight,
  selectRemoteTranslations,
} from '../../state/app.selectors';
import { bindAppLanguageSignal } from '../../utilities/app-language-signal.util';
import { buildRemoteTranslationCacheKey } from '../../utilities/remote-translate-cache.util';

@Pipe({
  name: 'remoteTranslate',
  pure: false,
  standalone: false,
})
export class RemoteTranslatePipe implements PipeTransform {
  private readonly _store = inject<Store<FullState>>(Store);
  private readonly _language = bindAppLanguageSignal(
    this._store,
    inject(ChangeDetectorRef)
  );
  private readonly _translations = this._store.selectSignal(
    selectRemoteTranslations
  );
  private readonly _inFlight = this._store.selectSignal(
    selectRemoteTranslationInFlight
  );

  public transform(value: string | null | undefined): string {
    const raw = value?.trim() ?? '';
    if (!raw) {
      return '';
    }

    const from = Languages.English;
    const to = this._language();
    if (to === from) {
      return raw;
    }

    const key = buildRemoteTranslationCacheKey(from, to, raw);
    const cached = this._translations()[key];
    if (cached !== undefined) {
      return cached;
    }

    if (!this._inFlight()[key]) {
      this._store.dispatch(requestRemoteTranslation({ text: raw, from, to }));
    }

    return APP_CONFIG.TRANSLATION.PENDING_PLACEHOLDER;
  }
}
