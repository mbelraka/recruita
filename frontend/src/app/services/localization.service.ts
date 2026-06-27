import { DateAdapter } from '@angular/material/core';
import { Injectable, OnDestroy, Injector } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, Subject, switchMap, takeUntil } from 'rxjs';

import { APP_CONFIG } from '../config/app.config';
import { Languages } from '../enums/language.enum';
import { FullState } from '../models/full-state.model';
import { setLanguage } from '../state/app.actions';
import { selectAppLanguage } from '../state/app.selectors';
import { translateInstantString } from '../utilities/localization.utils';

@Injectable({ providedIn: 'root' })
export class LocalizationService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly store: Store<FullState>,
    private readonly translate: TranslateService,
    private readonly injector: Injector
  ) {
    // Register supported languages with ngx-translate
    this.translate.addLangs([...APP_CONFIG.LOCALIZATION.SUPPORTED_LANGUAGES]);
    this.translate.setDefaultLang(APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE);

    // Latest language wins — cancel a stale translate.use when the user switches again.
    this.store
      .select(selectAppLanguage)
      .pipe(
        distinctUntilChanged(),
        switchMap((language) => {
          this.applyMaterialDateLocale(language);
          return this.translate.use(language);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.applyDocumentTitle());
  }

  public setLanguage(language: Languages): void {
    this.store.dispatch(setLanguage({ language }));
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyDocumentTitle(): void {
    const translated = translateInstantString(
      this.translate,
      APP_CONFIG.APP.SITE_TITLE_I18N_KEY
    );
    document.title =
      translated && translated !== APP_CONFIG.APP.SITE_TITLE_I18N_KEY
        ? translated
        : APP_CONFIG.APP.SITE_TITLE_FALLBACK;
  }

  private applyMaterialDateLocale(language: Languages): void {
    const localeId = APP_CONFIG.getLocale(language);
    queueMicrotask(() => {
      const adapter = this.injector.get<DateAdapter<unknown>>(
        DateAdapter,
        null,
        { optional: true }
      );
      adapter?.setLocale(localeId);
    });
  }
}
