import { ChangeDetectorRef, DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { APP_CONFIG } from '../../config/app.config';
import { Languages } from '../../enums/language.enum';
import { requestRemoteTranslation } from '../../state/app.actions';
import { initialAppState } from '../../state/app.reducer';
import { RemoteTranslatePipe } from './remote-translate.pipe';

describe('RemoteTranslatePipe', () => {
  let pipe: RemoteTranslatePipe;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RemoteTranslatePipe,
        provideMockStore({
          initialState: {
            app: {
              ...initialAppState,
              language: Languages.English,
            },
          },
        }),
        {
          provide: ChangeDetectorRef,
          useValue: { markForCheck: jasmine.createSpy('markForCheck') },
        },
        {
          provide: DestroyRef,
          useValue: { onDestroy: jasmine.createSpy('onDestroy') },
        },
      ],
    });

    pipe = TestBed.inject(RemoteTranslatePipe);
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
  });

  it('returns empty string for nullish and whitespace values', () => {
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform('   ')).toBe('');
  });

  it('returns raw text for English and does not dispatch', () => {
    expect(pipe.transform(' Hello ')).toBe('Hello');
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('returns cached translation for non-English language', () => {
    store.setState({
      app: {
        ...initialAppState,
        language: Languages.German,
        remoteTranslations: { 'en|de|Hello': 'Hallo' },
      },
    });
    (pipe as unknown as { _language: Languages })._language = Languages.German;

    expect(pipe.transform('Hello')).toBe('Hallo');
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('dispatches a store request and shows the pending placeholder', () => {
    (pipe as unknown as { _language: Languages })._language = Languages.French;

    expect(pipe.transform('Hello')).toBe(
      APP_CONFIG.TRANSLATION.PENDING_PLACEHOLDER
    );
    expect(store.dispatch).toHaveBeenCalledWith(
      requestRemoteTranslation({
        text: 'Hello',
        from: Languages.English,
        to: Languages.French,
      })
    );
  });
});
