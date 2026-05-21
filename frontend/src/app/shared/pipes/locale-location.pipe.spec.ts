import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import { Languages } from '../../enums/language.enum';
import { LocaleLocationPipe } from './locale-location.pipe';

describe('LocaleLocationPipe', () => {
  let pipe: LocaleLocationPipe;
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
        LocaleLocationPipe,
      ],
    });

    pipe = TestBed.inject(LocaleLocationPipe);
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null/undefined/blank', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('   ')).toBe('');
  });

  it('should localize known country aliases using selected language', () => {
    langSubject.next(Languages.Italian);
    const result = pipe.transform('Berlin, Germany');
    expect(result).toContain('Germania');
  });

  it('should localize ISO country codes using selected language', () => {
    langSubject.next(Languages.French);
    const result = pipe.transform('Paris, fr');
    expect(result).toContain('Paris');
    expect(result).not.toBe('Paris, fr');
  });

  it('should keep value unchanged when country cannot be localized', () => {
    const raw = 'Somewhere, Mars Colony';
    expect(pipe.transform(raw)).toBe(raw);
  });
});
