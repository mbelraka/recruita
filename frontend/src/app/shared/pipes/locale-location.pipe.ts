import { DestroyRef, inject, Pipe, PipeTransform } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import { APP_CONFIG } from '../../config/app.config';
import { Languages } from '../../enums/language.enum';
import { FullState } from '../../models/full-state.model';
import { selectAppLanguage } from '../../state/app.selectors';

@Pipe({
  name: 'localeLocation',
  pure: false,
  standalone: false,
})
export class LocaleLocationPipe implements PipeTransform {
  private readonly store = inject(Store<FullState>);
  private readonly destroyRef = inject(DestroyRef);
  private language: Languages = APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE;

  private readonly countryAliases: Record<string, string> = {
    USA: 'US',
    US: 'US',
    UK: 'GB',
    Germany: 'DE',
    Canada: 'CA',
    Italy: 'IT',
    Singapore: 'SG',
    Poland: 'PL',
    Spain: 'ES',
    Senegal: 'SN',
    Japan: 'JP',
    Denmark: 'DK',
  };

  public constructor() {
    this.store
      .select(selectAppLanguage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lang) => {
        this.language = lang;
      });
  }

  public transform(value: string | null | undefined): string {
    const raw = value?.trim();
    if (!raw) {
      return '';
    }

    const parts = raw.split(',').map((part) => part.trim());
    if (parts.length === 0) {
      return raw;
    }

    const countryToken = parts.at(-1);
    if (!countryToken) {
      return raw;
    }
    const localizedCountry = this._localizeCountry(countryToken);
    if (!localizedCountry) {
      return raw;
    }

    const lastIndex = parts.length - 1;
    parts[lastIndex] = localizedCountry;
    return parts.join(', ');
  }

  private _localizeCountry(countryToken: string): string | null {
    const locale = APP_CONFIG.getLocale(this.language);
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' });
    const normalized = countryToken.trim();
    const aliasCode = this.countryAliases[normalized];

    if (aliasCode) {
      return displayNames.of(aliasCode) ?? null;
    }

    if (/^[a-z]{2}$/i.test(normalized)) {
      return displayNames.of(normalized.toUpperCase()) ?? null;
    }

    return null;
  }
}
