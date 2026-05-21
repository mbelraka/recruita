import { APP_CONFIG } from '../../config/app.config';

/** Bootstrap `LOCALE_ID` / `MAT_DATE_LOCALE` from the default configured language. */
export function initialAngularLocaleFactory(): string {
  return APP_CONFIG.getLocale(APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE);
}
