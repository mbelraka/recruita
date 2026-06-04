import { Injectable } from '@angular/core';

import {
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory,
} from '@ngrx/data';
import { map, Observable, tap } from 'rxjs';

import { RecruitaEntityNames } from '../../../core/entity-data/recruita-entity-names';
import { Applicant } from '../models/applicant.model';
import { ApplicantDataService } from './applicant-data.service';

@Injectable({ providedIn: 'root' })
export class ApplicantEntityCollectionService extends EntityCollectionServiceBase<Applicant> {
  public constructor(
    serviceFactory: EntityCollectionServiceElementsFactory,
    private readonly _applicantData: ApplicantDataService
  ) {
    super(RecruitaEntityNames.Applicant, serviceFactory);
  }

  /** Loads the summary roster from the API and replaces the entity cache slice. */
  public loadRoster(): Observable<Applicant[]> {
    return this._applicantData.getAll().pipe(
      tap((applicants) => {
        this.addAllToCache(applicants);
        this.setLoaded(true);
        this.setLoading(false);
      }),
      map((applicants) => applicants)
    );
  }

  /** Loads full applicant rows (including notes) and merges them into the cache. */
  public loadFull(): Observable<Applicant[]> {
    return this._applicantData.getAllFull().pipe(
      tap((applicants) => {
        this.upsertManyInCache(applicants);
        this.setLoaded(true);
        this.setLoading(false);
      }),
      map((applicants) => applicants)
    );
  }
}
