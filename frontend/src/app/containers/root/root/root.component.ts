import {
  Component,
  ChangeDetectorRef,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import {
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  Observable,
  startWith,
} from 'rxjs';

import { NavLink } from 'src/app/modules/main/models/nav-link.model';

import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import { FullState } from '../../../models/full-state.model';
import { loadApplicants } from '../../../modules/applicants/state/applicants.actions';
import { loadProfile } from '../../../modules/main/state/profile.actions';
import { LocalizationService } from '../../../services/localization.service';
import { selectAppLanguage } from '../../../state/app.selectors';
import { isLanguage } from '../../../utilities/language.utils';
import { translateInstantString } from '../../../utilities/localization.utils';

@Component({
  selector: 'app-root-shell',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  standalone: false,
})
export class RootComponent implements OnInit {
  /** Landing / home route (main module). */
  public readonly landingRoute = APP_CONFIG.NAV_LINKS[0].link;

  public readonly navLinks: readonly NavLink[] = APP_CONFIG.NAV_LINKS;

  public readonly supportedLanguages =
    APP_CONFIG.LOCALIZATION.SUPPORTED_LANGUAGES;

  public currentRoute$!: Observable<NavLink | undefined>;

  public selectedLanguage: Languages = APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE;

  public get sortedSupportedLanguages(): readonly Languages[] {
    return [...this.supportedLanguages].sort((a, b) =>
      this._languageLabelCollator.compare(
        this.getLanguageLabel(a),
        this.getLanguageLabel(b)
      )
    );
  }

  private readonly _languageLabelCollator = new Intl.Collator(undefined, {
    sensitivity: 'base',
  });

  private readonly _destroyRef = inject(DestroyRef);
  private readonly _cdr = inject(ChangeDetectorRef);

  public constructor(
    private readonly _router: Router,
    private readonly _store: Store<FullState>,
    private readonly _localization: LocalizationService,
    private readonly _translate: TranslateService
  ) {}

  public ngOnInit(): void {
    this._store.dispatch(loadProfile());
    this._initApplicantsState();
    this._initSyncOnTabVisible();
    this._initCurrentRouteStream();
    this._syncLanguageSelectWithStore();
  }

  public onLanguageChange(value: unknown): void {
    if (isLanguage(value)) {
      this._localization.setLanguage(value);
    }
  }

  public getLanguageLabel(language: Languages): string {
    return translateInstantString(
      this._translate,
      `language.names.${language}`
    );
  }

  private _initApplicantsState(): void {
    this._store.dispatch(loadApplicants());
  }

  /** Re-fetch profile and applicants when the user returns to this tab. */
  private _initSyncOnTabVisible(): void {
    if (!APP_CONFIG.SYNC.REFRESH_ON_TAB_VISIBLE) {
      return;
    }

    fromEvent(document, 'visibilitychange')
      .pipe(
        filter(() => document.visibilityState === 'visible'),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(() => {
        this._store.dispatch(loadProfile());
        this._store.dispatch(loadApplicants());
      });
  }

  private _syncLanguageSelectWithStore(): void {
    this._store
      .select(selectAppLanguage)
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this._destroyRef))
      .subscribe((language) => {
        this.selectedLanguage = language;
        this._cdr.markForCheck();
      });
  }

  private _initCurrentRouteStream(): void {
    this.currentRoute$ = this._router.events.pipe(
      startWith(this._resolveNavForUrl(this._router.url)),
      map(() => this._resolveNavForUrl(this._router.url)),
      distinctUntilChanged()
    );
  }

  private _resolveNavForUrl(rawUrl: string): NavLink | undefined {
    const path = rawUrl.replace(/[#?].*$/, '');
    return this.navLinks.find((link) => link.link === path);
  }
}
