import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { DefaultDataService, HttpUrlGenerator } from '@ngrx/data';
import { Update } from '@ngrx/entity';
import { catchError, map, Observable, of, throwError } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { HttpStatusCode } from '../../../enums/http-status-code.enum';
import { ApplicantsService } from '../../../generated/api-client/services/applicants.service';
import { ApplicantSummaryDto } from '../../../generated/api-client/models/applicant-summary-dto';
import { RecruitaEntityNames } from '../../../core/entity-data/recruita-entity-names';
import { ApplicantRosterLoadResult } from '../models/applicant-roster-load-result.model';
import { Applicant } from '../models/applicant.model';
import {
  applicantFromApi,
  applicantToApiWrite,
  applicantsFromApi,
  applicantsFromApiSummary,
} from '../utilities/applicant-api.mapper';

/** Raw numeric form of the 304 status, for comparison against `HttpResponse.status`. */
const NOT_MODIFIED_STATUS: number = HttpStatusCode.NotModified;

@Injectable({ providedIn: 'root' })
export class ApplicantDataService extends DefaultDataService<Applicant> {
  public constructor(
    http: HttpClient,
    httpUrlGenerator: HttpUrlGenerator,
    private readonly _applicantsApi: ApplicantsService
  ) {
    super(RecruitaEntityNames.Applicant, http, httpUrlGenerator);
  }

  /** Summary roster projection (default list load). */
  public override getAll(): Observable<Applicant[]> {
    return this.loadRosterSync(null).pipe(
      map((result) => result.applicants ?? [])
    );
  }

  /** Conditional roster load with ETag support. */
  public loadRosterSync(
    ifNoneMatch: string | null
  ): Observable<ApplicantRosterLoadResult> {
    const api = APP_CONFIG.APPLICANTS.API;
    let headers = new HttpHeaders();
    if (ifNoneMatch) {
      headers = headers.set(api.ROSTER_ETAG_REQUEST_HEADER, ifNoneMatch);
    }

    return this.http
      .get<ApplicantSummaryDto[]>(api.BASE_PATH, {
        headers,
        observe: 'response',
      })
      .pipe(
        catchError((error: unknown) => {
          if (
            error instanceof HttpErrorResponse &&
            error.status === NOT_MODIFIED_STATUS
          ) {
            return of(
              new HttpResponse<ApplicantSummaryDto[]>({
                body: null,
                headers: error.headers,
                status: error.status,
                statusText: error.statusText,
                url: error.url ?? undefined,
              })
            );
          }
          return throwError(() => error);
        }),
        map((response) => this._mapRosterResponse(response))
      );
  }

  /** Full roster including notes — used before export. */
  public getAllFull(): Observable<Applicant[]> {
    return this._applicantsApi
      .listApplicantsFull()
      .pipe(map((records) => applicantsFromApi(records ?? [])));
  }

  public override getById(id: string | number): Observable<Applicant> {
    return this._applicantsApi
      .getApplicant({ id: String(id) })
      .pipe(map(applicantFromApi));
  }

  public override add(entity: Applicant): Observable<Applicant> {
    return this._applicantsApi
      .createApplicant({ body: applicantToApiWrite(entity) })
      .pipe(map(applicantFromApi));
  }

  public override update(update: Update<Applicant>): Observable<Applicant> {
    return this._applicantsApi
      .updateApplicant({
        id: String(update.id),
        body: applicantToApiWrite({
          id: String(update.id),
          ...update.changes,
        }),
      })
      .pipe(map(applicantFromApi));
  }

  private _mapRosterResponse(
    response: HttpResponse<ApplicantSummaryDto[]>
  ): ApplicantRosterLoadResult {
    const api = APP_CONFIG.APPLICANTS.API;
    const etag = response.headers.get('ETag');
    const rosterVersionHeader = response.headers.get(
      api.ROSTER_VERSION_RESPONSE_HEADER
    );
    const parsedVersion =
      rosterVersionHeader == null ? null : Number(rosterVersionHeader);
    const rosterVersion = Number.isFinite(parsedVersion) ? parsedVersion : null;

    if (response.status === NOT_MODIFIED_STATUS) {
      return {
        applicants: null,
        notModified: true,
        etag,
        rosterVersion,
      };
    }

    return {
      applicants: applicantsFromApiSummary(response.body ?? []),
      notModified: false,
      etag,
      rosterVersion,
    };
  }
}
