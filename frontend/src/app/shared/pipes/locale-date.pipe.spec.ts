import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { APP_CONFIG } from '../../config/app.config';
import { Languages } from '../../enums/language.enum';
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
  let mockStore: jasmine.SpyObj<Store>;
  let langSubject: Subject<Languages>;
  let destroyRefMock: Partial<DestroyRef>;

  beforeEach(() => {
    langSubject = new Subject<Languages>();
    mockStore = jasmine.createSpyObj('Store', ['select']);
    mockStore.select.and.returnValue(langSubject.asObservable());

    destroyRefMock = {
      onDestroy: jasmine.createSpy('onDestroy'),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Store, useValue: mockStore },
        { provide: DestroyRef, useValue: destroyRefMock },
        LocaleDatePipe,
      ],
    });

    pipe = TestBed.inject(LocaleDatePipe);
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
    // Just verify it doesn't return empty
    expect(result.length).toBeGreaterThan(0);
  });

  it('should respond to store language changes', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    langSubject.next(Languages.German);

    const resultDe = pipe.transform(
      date,
      APP_CONFIG.LOCALIZATION.ANGULAR_DATE_PIPE.DEFAULT
    );

    langSubject.next(Languages.French);
    const resultFr = pipe.transform(
      date,
      APP_CONFIG.LOCALIZATION.ANGULAR_DATE_PIPE.DEFAULT
    );

    expect(resultDe).not.toEqual(resultFr); // Likely different formatting
    expect(resultDe).toBeTruthy();
    expect(resultFr).toBeTruthy();
  });
});
