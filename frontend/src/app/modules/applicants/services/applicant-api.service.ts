import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  catchError,
  map,
  Observable,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { Applicant } from '../models/applicant.model';
import { ApplicantApiRecord } from '../models/applicant-api.model';
import {
  applicantFromApi,
  applicantToApiWrite,
  applicantsFromApi,
} from '../utilities/applicant-api.mapper';

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
    if (error instanceof TimeoutError) {
      return new Error(this.config.ERRORS.REQUEST_TIMEOUT);
    }
    const message = this._extractBackendErrorMessage(error);
    return new Error(message ?? this.config.ERRORS.UNREACHABLE);
  }

  private _extractBackendErrorMessage(error: unknown): string | null {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 404) {
        return this.config.ERRORS.NOT_AVAILABLE;
      }
      const payload = error.error;
      if (typeof payload === 'string' && payload.trim()) {
        return payload.trim();
      }
      if (payload && typeof payload === 'object') {
        const errText = (payload as Partial<Record<'error', unknown>>).error;
        if (typeof errText === 'string' && errText.trim()) {
          return errText.trim();
        }
      }
    }
    if (error instanceof Error && error.message.trim()) {
      return error.message.trim();
    }
    return null;
  }
}
