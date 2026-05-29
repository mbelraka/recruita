import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { catchError, map, Observable, throwError, timeout } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { ApplicantApiErrorMessage } from '../enums/applicant-api-error-message.enum';
import { Applicant } from '../models/applicant.model';
import { ApplicantApiRecord } from '../models/applicant-api-record.model';
import { ApplicantApiSummaryRecord } from '../models/applicant-api-summary-record.model';
import {
  applicantFromApi,
  applicantToApiWrite,
  applicantsFromApi,
  applicantsFromApiSummary,
} from '../utilities/applicant-api.mapper';
import { toHttpApiServiceError } from '../../../utilities/http-api-error.util';

@Injectable({ providedIn: 'root' })
export class ApplicantApiService {
  private get config() {
    return APP_CONFIG.APPLICANTS.API;
  }

  public constructor(private readonly _http: HttpClient) {}

  /** List projection without notes (default roster load). */
  public list(): Observable<Applicant[]> {
    return this._get<ApplicantApiSummaryRecord[]>(this.config.BASE_PATH).pipe(
      map((records) => applicantsFromApiSummary(records ?? []))
    );
  }

  /** Full roster including notes — used before export. */
  public listFull(): Observable<Applicant[]> {
    return this._get<ApplicantApiRecord[]>(this.config.FULL_LIST_PATH).pipe(
      map((records) => applicantsFromApi(records ?? []))
    );
  }

  public getById(id: string): Observable<Applicant> {
    return this._get<ApplicantApiRecord>(this._resourcePath(id)).pipe(
      map(applicantFromApi)
    );
  }

  public create(applicant: Applicant): Observable<Applicant> {
    return this._post<ApplicantApiRecord>(
      this.config.BASE_PATH,
      applicantToApiWrite(applicant)
    ).pipe(map(applicantFromApi));
  }

  public update(applicant: Applicant): Observable<Applicant> {
    return this._put<ApplicantApiRecord>(
      this._resourcePath(applicant.id),
      applicantToApiWrite(applicant)
    ).pipe(map(applicantFromApi));
  }

  public delete(id: string): Observable<void> {
    return this._delete(this._resourcePath(id));
  }

  private _get<T>(url: string): Observable<T> {
    return this._pipe(this._http.get<T>(url));
  }

  private _post<T>(url: string, body: unknown): Observable<T> {
    return this._pipe(this._http.post<T>(url, body));
  }

  private _put<T>(url: string, body: unknown): Observable<T> {
    return this._pipe(this._http.put<T>(url, body));
  }

  private _delete(url: string): Observable<void> {
    return this._pipe(this._http.delete<void>(url)).pipe(map(() => undefined));
  }

  private _pipe<T>(request$: Observable<T>): Observable<T> {
    return request$.pipe(
      timeout({ first: this.config.REQUEST_TIMEOUT_MS }),
      catchError((error: unknown) =>
        throwError(() => this._toServiceError(error))
      )
    );
  }

  private _resourcePath(id: string): string {
    return `${this.config.BASE_PATH}/${encodeURIComponent(id)}`;
  }

  private _toServiceError(error: unknown): Error {
    return toHttpApiServiceError(error, {
      requestTimeout: ApplicantApiErrorMessage.RequestTimeout,
      notAvailable: ApplicantApiErrorMessage.NotAvailable,
      unreachable: ApplicantApiErrorMessage.Unreachable,
    });
  }
}
