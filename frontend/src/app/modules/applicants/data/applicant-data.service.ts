import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { DefaultDataService, HttpUrlGenerator } from '@ngrx/data';
import { Update } from '@ngrx/entity';
import { map, Observable } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { Applicant } from '../models/applicant.model';
import { ApplicantApiRecord } from '../models/applicant-api-record.model';
import { ApplicantApiSummaryRecord } from '../models/applicant-api-summary-record.model';
import { RecruitaEntityNames } from '../../../core/entity-data/recruita-entity-names';
import {
  applicantFromApi,
  applicantToApiWrite,
  applicantsFromApi,
  applicantsFromApiSummary,
} from '../utilities/applicant-api.mapper';

@Injectable({ providedIn: 'root' })
export class ApplicantDataService extends DefaultDataService<Applicant> {
  public constructor(http: HttpClient, httpUrlGenerator: HttpUrlGenerator) {
    super(RecruitaEntityNames.Applicant, http, httpUrlGenerator);
  }

  /** Summary roster projection (default list load). */
  public override getAll(): Observable<Applicant[]> {
    return this.http
      .get<ApplicantApiSummaryRecord[]>(APP_CONFIG.APPLICANTS.API.BASE_PATH)
      .pipe(map((records) => applicantsFromApiSummary(records ?? [])));
  }

  /** Full roster including notes — used before export. */
  public getAllFull(): Observable<Applicant[]> {
    return this.http
      .get<ApplicantApiRecord[]>(APP_CONFIG.APPLICANTS.API.FULL_LIST_PATH)
      .pipe(map((records) => applicantsFromApi(records ?? [])));
  }

  public override getById(id: string | number): Observable<Applicant> {
    return this.http
      .get<ApplicantApiRecord>(
        `${APP_CONFIG.APPLICANTS.API.BASE_PATH}/${encodeURIComponent(String(id))}`
      )
      .pipe(map(applicantFromApi));
  }

  public override add(entity: Applicant): Observable<Applicant> {
    return this.http
      .post<ApplicantApiRecord>(
        APP_CONFIG.APPLICANTS.API.BASE_PATH,
        applicantToApiWrite(entity)
      )
      .pipe(map(applicantFromApi));
  }

  public override update(update: Update<Applicant>): Observable<Applicant> {
    const entity = { ...update.changes, id: update.id } as Applicant;
    return this.http
      .put<ApplicantApiRecord>(
        `${APP_CONFIG.APPLICANTS.API.BASE_PATH}/${encodeURIComponent(String(update.id))}`,
        applicantToApiWrite(entity)
      )
      .pipe(map(applicantFromApi));
  }
}
