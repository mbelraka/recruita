import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { APP_CONFIG } from '../../config/app.config';
import { Languages } from '../../enums/language.enum';
import { initialAppState } from '../../state/app.reducer';
import { LocaleNumberPipe } from './locale-number.pipe';

import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';

registerLocaleData(localeEn, 'en-US');
registerLocaleData(localeDe, 'de-DE');
registerLocaleData(localeFr, 'fr-FR');
registerLocaleData(localeIt, 'it-IT');

describe('LocaleNumberPipe', () => {
  let pipe: LocaleNumberPipe;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocaleNumberPipe,
        provideMockStore({
          initialState: { app: { ...initialAppState } },
        }),
        {
          provide: ChangeDetectorRef,
          useValue: { markForCheck: jasmine.createSpy('markForCheck') },
        },
      ],
    });

    pipe = TestBed.inject(LocaleNumberPipe);
    store = TestBed.inject(MockStore);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null, undefined, or empty string', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('should return empty string for invalid numbers', () => {
    expect(pipe.transform('invalid')).toBe('');
    expect(pipe.transform(Number.NaN)).toBe('');
  });

  it('should format number with default settings', () => {
    const result = pipe.transform(1234.567);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should format number given digits info', () => {
    const result = pipe.transform(
      1234.567,
      APP_CONFIG.LOCALIZATION.DEFAULT_NUMBER_DIGITS_INFO
    );
    expect(result).toBeTruthy();
  });

  it('should respond to store language changes', () => {
    store.setState({
      app: { ...initialAppState, language: Languages.German },
    });
    const resultDe = pipe.transform(
      1234.56,
      APP_CONFIG.LOCALIZATION.DEFAULT_NUMBER_DIGITS_INFO
    );

    store.setState({
      app: { ...initialAppState, language: Languages.English },
    });
    const resultEn = pipe.transform(
      1234.56,
      APP_CONFIG.LOCALIZATION.DEFAULT_NUMBER_DIGITS_INFO
    );

    expect(resultDe).not.toEqual(resultEn);
    expect(resultDe).toContain(',');
    expect(resultEn).toContain('.');
  });
});
