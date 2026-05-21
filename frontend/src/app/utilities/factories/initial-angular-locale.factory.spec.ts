import { APP_CONFIG } from '../../config/app.config';

import { initialAngularLocaleFactory } from './initial-angular-locale.factory';
import { localeIdFactory } from './locale-id.factory';
import { matDateLocaleFactory } from './mat-date-locale.factory';

describe('initialAngularLocaleFactory', () => {
  it('returns the configured default locale', () => {
    expect(initialAngularLocaleFactory()).toBe(
      APP_CONFIG.getLocale(APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE)
    );
  });
});

describe('localeIdFactory', () => {
  it('delegates to the initial locale factory', () => {
    expect(localeIdFactory()).toBe(initialAngularLocaleFactory());
  });
});

describe('matDateLocaleFactory', () => {
  it('delegates to the initial locale factory', () => {
    expect(matDateLocaleFactory()).toBe(initialAngularLocaleFactory());
  });
});
