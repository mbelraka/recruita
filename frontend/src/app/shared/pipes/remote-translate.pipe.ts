import {
  ChangeDetectorRef,
  DestroyRef,
  inject,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import { APP_CONFIG } from '../../config/app.config';
import { Languages } from '../../enums/language.enum';
import { FullState } from '../../models/full-state.model';
import { requestRemoteTranslation } from '../../state/app.actions';
import {
  selectAppLanguage,
  selectRemoteTranslationInFlight,
  selectRemoteTranslations,
} from '../../state/app.selectors';
import { buildRemoteTranslationCacheKey } from '../../utilities/remote-translate-cache.util';

@Pipe({
  name: 'remoteTranslate',
  pure: false,
  standalone: false,
})
export class RemoteTranslatePipe implements PipeTransform {
  private readonly _store = inject(Store<FullState>);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _translations = this._store.selectSignal(
    selectRemoteTranslations
  );
  private readonly _inFlight = this._store.selectSignal(
    selectRemoteTranslationInFlight
  );

  private _language: Languages = APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE;

  public constructor() {
    this._store
      .select(selectAppLanguage)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((lang) => {
        this._language = lang;
        this._cdr.markForCheck();
      });
  }

  public transform(value: string | null | undefined): string {
    const raw = value?.trim() ?? '';
    if (!raw) {
      return '';
    }

    const from = Languages.English;
    const to = this._language;
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
