import {
  ChangeDetectorRef,
  DestroyRef,
  inject,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Subscription, take } from 'rxjs';

import { APP_CONFIG } from '../../config/app.config';
import { Languages } from '../../enums/language.enum';
import { FullState } from '../../models/full-state.model';
import { RemoteTranslateService } from '../../services/remote-translate.service';
import { selectAppLanguage } from '../../state/app.selectors';

@Pipe({
  name: 'remoteTranslate',
  pure: false,
  standalone: false,
})
export class RemoteTranslatePipe implements PipeTransform {
  /** Shown only while a non-English translation is loading (avoids English “flash”). */
  private static readonly _PENDING = '\u2026';

  private readonly _store = inject(Store<FullState>);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _remoteTranslate = inject(RemoteTranslateService);

  private _language: Languages = APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE;
  private _lastKey: string | null = null;
  private _lastValue = '';
  private _translationSubscription: Subscription | undefined;

  public constructor() {
    this._destroyRef.onDestroy(() => this._cancelPendingTranslation());

    this._store
      .select(selectAppLanguage)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((lang) => {
        this._language = lang;
        this._lastKey = null;
        this._cancelPendingTranslation();
        this._cdr.markForCheck();
      });
  }

  public transform(value: string | null | undefined): string {
    const from = Languages.English;
    const to = this._language;
    const key = this._remoteTranslate.lookupKey(value, from, to);
    if (key === null) {
      this._lastKey = null;
      this._lastValue = '';
      this._cancelPendingTranslation();
      return '';
    }

    const raw = value?.trim() ?? '';

    if (this._lastKey === key) {
      return this._lastValue;
    }

    this._cancelPendingTranslation();

    if (to === Languages.English) {
      this._lastKey = key;
      this._lastValue = raw;
      return raw;
    }

    const cached = this._remoteTranslate.getCached(raw, from, to);
    if (cached !== undefined) {
      this._lastKey = key;
      this._lastValue = cached;
      return cached;
    }

    this._lastKey = key;
    this._lastValue = RemoteTranslatePipe._PENDING;

    this._translationSubscription = this._remoteTranslate
      .translate(raw, from, to)
      .pipe(take(1))
      .subscribe((translated) => {
        if (this._lastKey !== key) {
          return;
        }
        this._lastValue = translated;
        this._cdr.markForCheck();
      });

    return this._lastValue;
  }

  private _cancelPendingTranslation(): void {
    this._translationSubscription?.unsubscribe();
    this._translationSubscription = undefined;
  }
}
