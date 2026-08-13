import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { APP_CONFIG } from '../../config/app.config';
import { Languages } from '../../enums/language.enum';
import { initialAppState } from '../../state/app.reducer';
import { LocaleDatePipe } from './locale-date.pipe';

import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';

registerLocaleData(localeEn, 'en-US');
registerLocaleData(localeDe, 'de-DE');
registerLocaleData(localeFr, 'fr-FR');
registerLocaleData(localeIt, 'it-IT');

describe('LocaleDatePipe', () => {
  let pipe: LocaleDatePipe;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocaleDatePipe,
        provideMockStore({
          initialState: { app: { ...initialAppState } },
        }),
        {
          provide: ChangeDetectorRef,
          useValue: { markForCheck: jasmine.createSpy('markForCheck') },
        },
      ],
    });

    pipe = TestBed.inject(LocaleDatePipe);
    store = TestBed.inject(MockStore);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null or undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should format date using default language (en-US by default)', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    const result = pipe.transform(date);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should respond to store language changes', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    store.setState({
      app: { ...initialAppState, language: Languages.German },
    });

    const resultDe = pipe.transform(
      date,
      APP_CONFIG.LOCALIZATION.ANGULAR_DATE_PIPE.DEFAULT
    );

    store.setState({
      app: { ...initialAppState, language: Languages.French },
    });
    const resultFr = pipe.transform(
      date,
      APP_CONFIG.LOCALIZATION.ANGULAR_DATE_PIPE.DEFAULT
    );

    expect(resultDe).not.toEqual(resultFr);
    expect(resultDe).toBeTruthy();
    expect(resultFr).toBeTruthy();
  });
});
