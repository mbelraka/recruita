import { IntlDisplayNamesType } from '../enums/intl-display-names-type.enum';

const regionDisplayNamesByLocale = new Map<string, Intl.DisplayNames>();

/** One `Intl.DisplayNames` instance per locale (region names). */
export function regionDisplayNames(locale: string): Intl.DisplayNames {
  const cached = regionDisplayNamesByLocale.get(locale);
  if (cached) {
    return cached;
  }
  const created = new Intl.DisplayNames([locale], {
    type: IntlDisplayNamesType.Region,
  });
  regionDisplayNamesByLocale.set(locale, created);
  return created;
}
