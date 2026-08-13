import { formatDate } from '@angular/common';
import { ChangeDetectorRef, inject, Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngrx/store';

import { APP_CONFIG } from '../../config/app.config';
import { FullState } from '../../models/full-state.model';
import { bindAppLanguageSignal } from '../../utilities/app-language-signal.util';

@Pipe({
  name: 'localeDate',
  pure: false,
  standalone: false,
})
export class LocaleDatePipe implements PipeTransform {
  private readonly _language = bindAppLanguageSignal(
    inject<Store<FullState>>(Store),
    inject(ChangeDetectorRef)
  );

  public transform(
    value: Date | string | number | null | undefined,
    format = APP_CONFIG.LOCALIZATION.ANGULAR_DATE_PIPE.DEFAULT
  ): string {
    if (value === null || value === undefined) {
      return '';
    }
    const locale = APP_CONFIG.getLocale(this._language());
    const resolvedFormat =
      format === APP_CONFIG.LOCALIZATION.ANGULAR_DATE_PIPE.DEFAULT
        ? APP_CONFIG.LOCALIZATION.ANGULAR_DATE_PIPE.LONG
        : format;
    return formatDate(value, resolvedFormat, locale) ?? '';
  }
}
