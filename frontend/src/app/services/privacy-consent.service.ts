import { Injectable, inject } from '@angular/core';

import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, combineLatest, map, take } from 'rxjs';

import { APP_CONFIG } from '../config/app.config';
import {
  PRIVACY_CONSENT_VERSION,
  PRIVACY_DATA_EXPORT_NOTE,
  PRIVACY_POST_ERASE_APP_PATH,
} from '../constants/privacy.constants';
import { FullState } from '../models/full-state.model';
import type { PrivacyConsentFormState } from '../models/privacy-consent-form-state.model';
import type { StoredPrivacyConsent } from '../models/stored-privacy-consent.model';
import { selectAllApplicants } from '../modules/applicants/state/applicants.selectors';
import { selectAppLanguage } from '../state/app.selectors';

@Injectable({ providedIn: 'root' })
export class PrivacyConsentService {
  private static readonly _ALL_DISABLED: PrivacyConsentFormState = {
    optionalRemoteTranslation: false,
    optionalGeocoding: false,
    optionalAiMatching: false,
  };

  private static readonly _ALL_ENABLED: PrivacyConsentFormState = {
    optionalRemoteTranslation: true,
    optionalGeocoding: true,
    optionalAiMatching: true,
  };

  private readonly _store = inject(Store<FullState>);
  private readonly _consent$ = new BehaviorSubject<StoredPrivacyConsent | null>(
    null
  );

  public consent$(): Observable<StoredPrivacyConsent | null> {
    return this._consent$.asObservable();
  }

  public snapshot(): StoredPrivacyConsent | null {
    return this._consent$.value;
  }

  /** Completed flow and policy version is current. */
  public isConsentCompleteAndCurrent(): boolean {
    const c = this.snapshot();
    return !!c && c.complete === true && c.version === PRIVACY_CONSENT_VERSION;
  }

  public optionalRemoteTranslation(): boolean {
    return this.snapshot()?.optionalRemoteTranslation === true;
  }

  public optionalGeocoding(): boolean {
    return this.snapshot()?.optionalGeocoding === true;
  }

  public optionalAiMatching(): boolean {
    return this.snapshot()?.optionalAiMatching === true;
  }

  /** Form snapshot for dialogs (defaults when no consent on file yet). */
  public formStateFromSnapshot(): PrivacyConsentFormState {
    const c = this.snapshot();
    return {
      optionalRemoteTranslation: c?.optionalRemoteTranslation ?? false,
      optionalGeocoding: c?.optionalGeocoding ?? false,
      optionalAiMatching: c?.optionalAiMatching ?? false,
    };
  }

  public saveNecessaryOnly(): void {
    this._persistComplete(PrivacyConsentService._ALL_DISABLED);
  }

  public saveAcceptAllOptional(): void {
    this._persistComplete(PrivacyConsentService._ALL_ENABLED);
  }

  public saveCustom(choices: PrivacyConsentFormState): void {
    this._persistComplete(choices);
  }

  /** Clear consent so the gate is shown again after next choice. */
  public resetConsentDecision(): void {
    this._consent$.next(null);
  }

  /** Reload the app to reset in-memory session state (consent, NgRx slices). */
  public eraseSessionDataAndReload(): void {
    if (typeof window !== 'undefined') {
      window.location.assign(PRIVACY_POST_ERASE_APP_PATH);
    }
  }

  public buildDataExportJson$(): Observable<string> {
    return combineLatest([
      this._store.select(selectAllApplicants),
      this._store.select(selectAppLanguage),
    ]).pipe(
      take(1),
      map(([applicants, language]) =>
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            note: PRIVACY_DATA_EXPORT_NOTE,
            applicants,
            language,
            privacyConsentVersion: this.snapshot()?.version ?? null,
          },
          null,
          APP_CONFIG.EXPORT.JSON_INDENT_SPACES
        )
      )
    );
  }

  private _persist(record: StoredPrivacyConsent): void {
    this._consent$.next(record);
  }

  private _persistComplete(choices: PrivacyConsentFormState): void {
    this._persist({
      version: PRIVACY_CONSENT_VERSION,
      savedAtIso: new Date().toISOString(),
      complete: true,
      optionalRemoteTranslation: choices.optionalRemoteTranslation,
      optionalGeocoding: choices.optionalGeocoding,
      optionalAiMatching: choices.optionalAiMatching,
    });
  }
}
