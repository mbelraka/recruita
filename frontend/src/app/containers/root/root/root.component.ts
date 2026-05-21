import { afterNextRender, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, map, Observable, startWith } from 'rxjs';

import { NavLink } from 'src/app/modules/main/models/nav-link.model';

import { APP_CONFIG } from '../../../config/app.config';
import { Languages } from '../../../enums/language.enum';
import { FullState } from '../../../models/full-state.model';
import { loadApplicants } from '../../../modules/applicants/state/applicants.actions';
import { LocalizationService } from '../../../services/localization.service';
import { PrivacyConsentDialogService } from '../privacy/privacy-consent-dialog.service';
import { selectAppLanguage } from '../../../state/app.selectors';
import { isLanguage } from '../../../utilities/language.utils';

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

  public readonly language$ = this._store.select(selectAppLanguage);

  public currentRoute$!: Observable<NavLink | undefined>;

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

  public constructor(
    private readonly _router: Router,
    private readonly _store: Store<FullState>,
    private readonly _localization: LocalizationService,
    private readonly _translate: TranslateService,
    private readonly _privacyConsentDialog: PrivacyConsentDialogService
  ) {
    afterNextRender(() => {
      this._privacyConsentDialog.openConsentDialogIfRequired();
    });
  }

  public ngOnInit(): void {
    this._initApplicantsState();
    this._initCurrentRouteStream();
  }

  public onLanguageChange(value: unknown): void {
    if (isLanguage(value)) {
      this._localization.setLanguage(value);
    }
  }

  public getLanguageLabel(language: Languages): string {
    return this._translate.instant(`language.names.${language}`);
  }

  private _initApplicantsState(): void {
    this._store.dispatch(loadApplicants());
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
