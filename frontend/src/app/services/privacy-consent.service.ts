import { Injectable, inject } from '@angular/core';

import { Store } from '@ngrx/store';
import { Observable, combineLatest, map, take } from 'rxjs';

import { APP_CONFIG } from '../config/app.config';
import {
  PRIVACY_CONSENT_VERSION,
  PRIVACY_DATA_EXPORT_NOTE,
  PRIVACY_POST_ERASE_APP_PATH,
} from '../constants/privacy.constants';
import { FullState } from '../models/full-state.model';
import type { PrivacyConsentFormState } from '../models/privacy-consent-form-state.model';
import type { PrivacyDataExportPayload } from '../models/privacy-data-export-payload.model';
import type { Profile } from '../modules/main/models/profile.model';
import { selectAllApplicants } from '../modules/applicants/state/applicants.selectors';
import {
  selectAllowsAiMatching,
  selectOptionalAiMatching,
  selectOptionalGeocoding,
  selectOptionalRemoteTranslation,
  selectPrivacyConsentComplete,
  selectProfilePrivacyChoices,
} from '../modules/main/state/main.selectors';
import { selectAppLanguage } from '../state/app.selectors';

/** Privacy consent reads from the shared admin profile in NgRx (synced with the API). */
@Injectable({ providedIn: 'root' })
export class PrivacyConsentService {
  private readonly _store = inject(Store<FullState>);
  private readonly _privacyConsentComplete = this._store.selectSignal(
    selectPrivacyConsentComplete
  );
  private readonly _profilePrivacyChoices = this._store.selectSignal(
    selectProfilePrivacyChoices
  );
  private readonly _optionalRemoteTranslation = this._store.selectSignal(
    selectOptionalRemoteTranslation
  );
  private readonly _optionalGeocoding = this._store.selectSignal(
    selectOptionalGeocoding
  );
  private readonly _optionalAiMatching = this._store.selectSignal(
    selectOptionalAiMatching
  );
  private readonly _allowsAiMatching = this._store.selectSignal(
    selectAllowsAiMatching
  );

  /** Profile loaded and privacy notice accepted (persisted on the admin profile row). */
  public isConsentCompleteAndCurrent(): boolean {
    return this._privacyConsentComplete();
  }

  public optionalRemoteTranslation(): boolean {
    return this._optionalRemoteTranslation();
  }

  public optionalRemoteTranslation$(): Observable<boolean> {
    return this._store.select(selectOptionalRemoteTranslation);
  }

  public optionalGeocoding(): boolean {
    return this._optionalGeocoding();
  }

  public optionalAiMatching(): boolean {
    return this._optionalAiMatching();
  }

  public optionalAiMatching$(): Observable<boolean> {
    return this._store.select(selectOptionalAiMatching);
  }

  /** Privacy notice accepted and optional AI matching enabled. */
  public allowsAiMatching(): boolean {
    return this._allowsAiMatching();
  }

  public allowsAiMatching$(): Observable<boolean> {
    return this._store.select(selectAllowsAiMatching);
  }

  /** Form snapshot for dialogs (defaults when profile is not loaded yet). */
  public formStateFromSnapshot(): PrivacyConsentFormState {
    return this._profilePrivacyChoices();
  }

  /** Reload the app; NgRx rehydrates from the API (server profile and applicants unchanged). */
  public eraseSessionDataAndReload(): void {
    if (typeof globalThis !== 'undefined') {
      globalThis.location.assign(PRIVACY_POST_ERASE_APP_PATH);
    }
  }

  public buildDataExportJson$(
    profile: Profile | null = null
  ): Observable<string> {
    return combineLatest([
      this._store.select(selectAllApplicants),
      this._store.select(selectAppLanguage),
      this._store.select(selectPrivacyConsentComplete),
    ]).pipe(
      take(1),
      map(([applicants, language, consentComplete]) => {
        const payload: PrivacyDataExportPayload = {
          exportedAt: new Date().toISOString(),
          note: PRIVACY_DATA_EXPORT_NOTE,
          profile,
          applicants,
          language,
          privacyConsentVersion: consentComplete
            ? PRIVACY_CONSENT_VERSION
            : null,
        };
        return JSON.stringify(
          payload,
          null,
          APP_CONFIG.EXPORT.JSON_INDENT_SPACES
        );
      })
    );
  }
}
