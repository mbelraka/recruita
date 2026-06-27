import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { LocaleNumberPipe } from './locale-number.pipe';
import { Languages } from '../../enums/language.enum';

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
        LocaleNumberPipe,
      ],
    });

    pipe = TestBed.inject(LocaleNumberPipe);
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
    const result = pipe.transform(1234.567, '1.1-1');
    expect(result).toBeTruthy();
    // 1234.567 to 1 decimal should have 1 decimal
  });

  it('should respond to store language changes', () => {
    langSubject.next(Languages.German);
    // In DE, 1234.56 uses dot for thousands and comma for decimals: 1.234,56
    const resultDe = pipe.transform(1234.56, '1.2-2');

    langSubject.next(Languages.English);
    // In EN, 1234.56 uses comma for thousands and dot for decimals: 1,234.56
    const resultEn = pipe.transform(1234.56, '1.2-2');

    expect(resultDe).not.toEqual(resultEn);
    expect(resultDe).toContain(','); // DE separator
    expect(resultEn).toContain('.'); // EN separator
  });
});
