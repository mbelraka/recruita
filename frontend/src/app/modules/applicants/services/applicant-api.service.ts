import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { catchError, map, Observable, throwError, timeout } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { ApplicantApiErrorMessage } from '../enums/applicant-api-error-message.enum';
import { Applicant } from '../models/applicant.model';
import { ApplicantApiRecord } from '../models/applicant-api.model';
import {
  applicantFromApi,
  applicantToApiWrite,
  applicantsFromApi,
} from '../utilities/applicant-api.mapper';
import { toHttpApiServiceError } from '../../../utilities/http-api-error.util';

@Injectable({ providedIn: 'root' })
export class ApplicantApiService {
  private get config() {
    return APP_CONFIG.APPLICANTS.API;
  }

  public constructor(private readonly _http: HttpClient) {}

  public list(): Observable<Applicant[]> {
    return this._http.get<ApplicantApiRecord[]>(this.config.BASE_PATH).pipe(
      timeout({ first: this.config.REQUEST_TIMEOUT_MS }),
      map((records) => applicantsFromApi(records ?? [])),
      catchError((error: unknown) =>
        throwError(() => this._toServiceError(error))
      )
    );
  }

  public create(applicant: Applicant): Observable<Applicant> {
    return this._http
      .post<ApplicantApiRecord>(
        this.config.BASE_PATH,
        applicantToApiWrite(applicant)
      )
      .pipe(
        timeout({ first: this.config.REQUEST_TIMEOUT_MS }),
        map(applicantFromApi),
        catchError((error: unknown) =>
          throwError(() => this._toServiceError(error))
        )
      );
  }

  public update(applicant: Applicant): Observable<Applicant> {
    return this._http
      .put<ApplicantApiRecord>(
        `${this.config.BASE_PATH}/${encodeURIComponent(applicant.id)}`,
        applicantToApiWrite(applicant)
      )
      .pipe(
        timeout({ first: this.config.REQUEST_TIMEOUT_MS }),
        map(applicantFromApi),
        catchError((error: unknown) =>
          throwError(() => this._toServiceError(error))
        )
      );
  }

  public delete(id: string): Observable<void> {
    return this._http
      .delete<void>(`${this.config.BASE_PATH}/${encodeURIComponent(id)}`)
      .pipe(
        timeout({ first: this.config.REQUEST_TIMEOUT_MS }),
        map(() => undefined),
        catchError((error: unknown) =>
          throwError(() => this._toServiceError(error))
        )
      );
  }

  private _toServiceError(error: unknown): Error {
    return toHttpApiServiceError(error, {
      requestTimeout: ApplicantApiErrorMessage.RequestTimeout,
      notAvailable: ApplicantApiErrorMessage.NotAvailable,
      unreachable: ApplicantApiErrorMessage.Unreachable,
    });
  }
}
