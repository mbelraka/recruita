import { formatDate } from '@angular/common';
import { DestroyRef, inject, Pipe, PipeTransform } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import { APP_CONFIG } from '../../config/app.config';
import { Languages } from '../../enums/language.enum';
import { FullState } from '../../models/full-state.model';
import { selectAppLanguage } from '../../state/app.selectors';

@Pipe({
  name: 'localeDate',
  pure: false,
  standalone: false,
})
export class LocaleDatePipe implements PipeTransform {
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
    value: Date | string | number | null | undefined,
    format = APP_CONFIG.LOCALIZATION.ANGULAR_DATE_PIPE.DEFAULT
  ): string {
    if (value === null || value === undefined) {
      return '';
    }
    const locale = APP_CONFIG.getLocale(this.language);
    const resolvedFormat =
      format === APP_CONFIG.LOCALIZATION.ANGULAR_DATE_PIPE.DEFAULT
        ? APP_CONFIG.LOCALIZATION.ANGULAR_DATE_PIPE.LONG
        : format;
    return formatDate(value, resolvedFormat, locale) ?? '';
  }
}
