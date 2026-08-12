import { formatNumber } from '@angular/common';
import { DestroyRef, inject, Pipe, PipeTransform } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import { APP_CONFIG } from '../../config/app.config';
import { Languages } from '../../enums/language.enum';
import { FullState } from '../../models/full-state.model';
import { selectAppLanguage } from '../../state/app.selectors';

@Pipe({
  name: 'localeNumber',
  pure: false,
  standalone: false,
})
export class LocaleNumberPipe implements PipeTransform {
  private readonly store = inject(Store<FullState>);
  private readonly destroyRef = inject(DestroyRef);
  private language: Languages = APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE;

  constructor() {
    this.store
      .select(selectAppLanguage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lang) => {
        this.language = lang;
      });
  }

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
    const locale = APP_CONFIG.getLocale(this.language);
    return formatNumber(
      num,
      locale,
      digitsInfo ?? APP_CONFIG.LOCALIZATION.DEFAULT_NUMBER_DIGITS_INFO
    );
  }
}
