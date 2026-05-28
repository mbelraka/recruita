import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { DateAdapter } from '@angular/material/core';
import { Subject, of } from 'rxjs';

import { LocalizationService } from './localization.service';
import { Languages } from '../enums/language.enum';
import { setLanguage } from '../state/app.actions';

describe('LocalizationService', () => {
  let service: LocalizationService;
  let mockStore: jasmine.SpyObj<Store>;
  let mockTranslate: jasmine.SpyObj<TranslateService>;
  let mockDateAdapter: jasmine.SpyObj<DateAdapter<unknown>>;
  let stateSubject: Subject<Languages>;

  beforeEach(() => {
    stateSubject = new Subject<Languages>();
    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);
    mockStore.select.and.returnValue(stateSubject.asObservable());

    mockTranslate = jasmine.createSpyObj('TranslateService', [
      'addLangs',
      'setDefaultLang',
      'use',
    ]);
    mockTranslate.use.and.returnValue(of(undefined));
    mockDateAdapter = jasmine.createSpyObj('DateAdapter', ['setLocale']);

    TestBed.configureTestingModule({
      providers: [
        LocalizationService,
        { provide: Store, useValue: mockStore },
        { provide: TranslateService, useValue: mockTranslate },
        { provide: DateAdapter, useValue: mockDateAdapter },
      ],
    });
  });

  it('should be created and initialize translation default languages', () => {
    service = TestBed.inject(LocalizationService);
    expect(service).toBeTruthy();
    expect(mockTranslate.addLangs).toHaveBeenCalled();
    expect(mockTranslate.setDefaultLang).toHaveBeenCalled();
  });

  it('should subscribe to store and apply language and date locale', fakeAsync(() => {
    service = TestBed.inject(LocalizationService);
    stateSubject.next(Languages.German);

    // allow the queueMicrotask to execute
    tick();

    expect(mockTranslate.use).toHaveBeenCalledWith(Languages.German);
    expect(mockDateAdapter.setLocale).toHaveBeenCalledWith('de-DE');
  }));

  it('should apply locale even if date adapter is not provided', fakeAsync(() => {
    // Override providers to simulate no DateAdapter
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        LocalizationService,
        { provide: Store, useValue: mockStore },
        { provide: TranslateService, useValue: mockTranslate },
      ],
    });

    service = TestBed.inject(LocalizationService);
    stateSubject.next(Languages.English);

    // Verify it doesn't throw when DateAdapter is null
    expect(() => tick()).not.toThrow();
  }));

  it('should dispatch setLanguage action', () => {
    service = TestBed.inject(LocalizationService);
    service.setLanguage(Languages.German);
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      setLanguage({ language: Languages.German })
    );
  });

  it('should complete subject on destroy', () => {
    service = TestBed.inject(LocalizationService);
    const destroySpy = spyOn((service as any).destroy$, 'next');
    const completeSpy = spyOn((service as any).destroy$, 'complete');

    service.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
