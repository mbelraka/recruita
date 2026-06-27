import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { DefaultDataService, HttpUrlGenerator } from '@ngrx/data';
import { Update } from '@ngrx/entity';
import { map, Observable } from 'rxjs';

import { ApplicantsService } from '../../../generated/api-client/services/applicants.service';
import { RecruitaEntityNames } from '../../../core/entity-data/recruita-entity-names';
import { Applicant } from '../models/applicant.model';
import {
  applicantFromApi,
  applicantToApiWrite,
  applicantsFromApi,
  applicantsFromApiSummary,
} from '../utilities/applicant-api.mapper';

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
    return this._applicantsApi
      .listApplicantSummaries()
      .pipe(map((records) => applicantsFromApiSummary(records ?? [])));
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
}
