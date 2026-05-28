import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { catchError, map, Observable, throwError, timeout } from 'rxjs';

import { APP_CONFIG } from '../config/app.config';
import { ProfileApiErrorMessage } from '../modules/main/enums/profile-api-error-message.enum';
import type { Profile } from '../modules/main/models/profile.model';
import type { ProfileApiRecord } from '../modules/main/models/profile-api-record.model';
import type { SaveProfileRequest } from '../modules/main/models/save-profile-request.model';
import { isLanguage } from '../utilities/language.utils';
import { toHttpApiServiceError } from '../utilities/http-api-error.util';

@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private get config() {
    return APP_CONFIG.PROFILE.API;
  }

  public constructor(private readonly _http: HttpClient) {}

  public getById(id: string): Observable<Profile> {
    return this._http
      .get<ProfileApiRecord>(
        `${this.config.BASE_PATH}/${encodeURIComponent(id)}`
      )
      .pipe(
        timeout({ first: this.config.REQUEST_TIMEOUT_MS }),
        map((record) => this._fromApi(record)),
        catchError((error: unknown) =>
          throwError(() => this._toServiceError(error))
        )
      );
  }

  public create(request: SaveProfileRequest): Observable<Profile> {
    return this._http
      .post<ProfileApiRecord>(this.config.BASE_PATH, request)
      .pipe(
        timeout({ first: this.config.REQUEST_TIMEOUT_MS }),
        map((record) => this._fromApi(record)),
        catchError((error: unknown) =>
          throwError(() => this._toServiceError(error))
        )
      );
  }

  public update(id: string, request: SaveProfileRequest): Observable<Profile> {
    return this._http
      .put<ProfileApiRecord>(
        `${this.config.BASE_PATH}/${encodeURIComponent(id)}`,
        request
      )
      .pipe(
        timeout({ first: this.config.REQUEST_TIMEOUT_MS }),
        map((record) => this._fromApi(record)),
        catchError((error: unknown) =>
          throwError(() => this._toServiceError(error))
        )
      );
  }

  /** Creates or updates the shared admin profile row. */
  public save(
    request: SaveProfileRequest,
    existing: Profile | null
  ): Observable<Profile> {
    const id = APP_CONFIG.PROFILE.DEFAULT_ID;
    return existing?.id === id
      ? this.update(id, request)
      : this.create(request);
  }

  private _fromApi(record: ProfileApiRecord): Profile {
    return {
      id: record.id,
      privacyNoticeAccepted: record.privacyNoticeAccepted === true,
      lastLanguage: isLanguage(record.lastLanguage)
        ? record.lastLanguage
        : APP_CONFIG.LOCALIZATION.DEFAULT_LANGUAGE,
      optionalRemoteTranslation: record.optionalRemoteTranslation === true,
      optionalGeocoding: record.optionalGeocoding === true,
      optionalAiMatching: record.optionalAiMatching === true,
    };
  }

  private _toServiceError(error: unknown): Error {
    return toHttpApiServiceError(error, {
      requestTimeout: ProfileApiErrorMessage.RequestTimeout,
      notAvailable: ProfileApiErrorMessage.NotAvailable,
      unreachable: ProfileApiErrorMessage.Unreachable,
    });
  }
}
