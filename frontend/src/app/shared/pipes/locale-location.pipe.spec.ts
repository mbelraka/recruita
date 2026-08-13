import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { Languages } from '../../enums/language.enum';
import { initialAppState } from '../../state/app.reducer';
import { LocaleLocationPipe } from './locale-location.pipe';

describe('LocaleLocationPipe', () => {
  let pipe: LocaleLocationPipe;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LocaleLocationPipe,
        provideMockStore({
          initialState: { app: { ...initialAppState } },
        }),
        {
          provide: ChangeDetectorRef,
          useValue: { markForCheck: jasmine.createSpy('markForCheck') },
        },
      ],
    });

    pipe = TestBed.inject(LocaleLocationPipe);
    store = TestBed.inject(MockStore);
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
    store.setState({
      app: { ...initialAppState, language: Languages.Italian },
    });
    const result = pipe.transform('Berlin, Germany');
    expect(result).toContain('Germania');
  });

  it('should localize ISO country codes using selected language', () => {
    store.setState({
      app: { ...initialAppState, language: Languages.French },
    });
    const result = pipe.transform('Paris, fr');
    expect(result).toContain('Paris');
    expect(result).not.toBe('Paris, fr');
  });

  it('should keep value unchanged when country cannot be localized', () => {
    const raw = 'Somewhere, Mars Colony';
    expect(pipe.transform(raw)).toBe(raw);
  });

  it('should localize Austria and Switzerland in German', () => {
    store.setState({
      app: { ...initialAppState, language: Languages.German },
    });
    expect(pipe.transform('Vienna, Austria')).toContain('Österreich');
    expect(pipe.transform('Zurich, Switzerland')).toContain('Schweiz');
  });
});
