import { formatNumber } from '@angular/common';
import { ChangeDetectorRef, inject, Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngrx/store';

import { APP_CONFIG } from '../../config/app.config';
import { FullState } from '../../models/full-state.model';
import { bindAppLanguageSignal } from '../../utilities/app-language-signal.util';

@Pipe({
  name: 'localeNumber',
  pure: false,
  standalone: false,
})
export class LocaleNumberPipe implements PipeTransform {
  private readonly _language = bindAppLanguageSignal(
    inject<Store<FullState>>(Store),
    inject(ChangeDetectorRef)
  );

  public transform(
    value: number | string | null | undefined,
    digitsInfo?: string
  ): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    const num = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(num)) {
      return '';
    }
    const locale = APP_CONFIG.getLocale(this._language());
    return formatNumber(
      num,
      locale,
      digitsInfo ?? APP_CONFIG.LOCALIZATION.DEFAULT_NUMBER_DIGITS_INFO
    );
  }
}
