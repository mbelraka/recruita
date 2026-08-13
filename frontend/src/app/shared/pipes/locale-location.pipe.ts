import { ChangeDetectorRef, inject, Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngrx/store';

import { APP_CONFIG } from '../../config/app.config';
import { FullState } from '../../models/full-state.model';
import { bindAppLanguageSignal } from '../../utilities/app-language-signal.util';
import { regionDisplayNames } from '../../utilities/region-display-names.util';

@Pipe({
  name: 'localeLocation',
  pure: false,
  standalone: false,
})
export class LocaleLocationPipe implements PipeTransform {
  private readonly _language = bindAppLanguageSignal(
    inject<Store<FullState>>(Store),
    inject(ChangeDetectorRef)
  );

  private readonly countryAliases: Record<string, string> = {
    USA: 'US',
    US: 'US',
    UK: 'GB',
    Germany: 'DE',
    Austria: 'AT',
    Switzerland: 'CH',
    Canada: 'CA',
    Italy: 'IT',
    Singapore: 'SG',
    Poland: 'PL',
    Spain: 'ES',
    Senegal: 'SN',
    Japan: 'JP',
    Denmark: 'DK',
  };

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
    const locale = APP_CONFIG.getLocale(this._language());
    const displayNames = regionDisplayNames(locale);
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
