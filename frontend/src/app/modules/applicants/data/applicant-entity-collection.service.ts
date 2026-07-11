import { Injectable } from '@angular/core';

import {
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory,
} from '@ngrx/data';
import { map, Observable, switchMap, take, tap } from 'rxjs';

import { RecruitaEntityNames } from '../../../core/entity-data/recruita-entity-names';
import { ApplicantRosterLoadResult } from '../models/applicant-roster-load-result.model';
import { Applicant } from '../models/applicant.model';
import {
  applicantHasNotesLoaded,
  mergeApplicantsPreservingNotes,
} from '../utilities/applicant-roster-cache.util';
import { ApplicantDataService } from './applicant-data.service';

@Injectable({ providedIn: 'root' })
export class ApplicantEntityCollectionService extends EntityCollectionServiceBase<Applicant> {
  public constructor(
    serviceFactory: EntityCollectionServiceElementsFactory,
    private readonly _applicantData: ApplicantDataService
  ) {
    super(RecruitaEntityNames.Applicant, serviceFactory);
  }

  /** Loads the summary roster, preserving cached notes and honoring roster ETags. */
  public loadRoster(
    ifNoneMatch: string | null = null
  ): Observable<ApplicantRosterLoadResult> {
    return this.entities$.pipe(
      take(1),
      switchMap((entities) =>
        this._applicantData.loadRosterSync(ifNoneMatch).pipe(
          tap((result) => {
            if (result.notModified) {
              this.setLoaded(true);
              this.setLoading(false);
              return;
            }

            const merged = mergeApplicantsPreservingNotes(
              result.applicants ?? [],
              Object.values(entities)
            );
            this.addAllToCache(merged);
            this.setLoaded(true);
            this.setLoading(false);
          })
        )
      )
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

  public areNotesLoadedForRoster(): Observable<boolean> {
    return this.entities$.pipe(
      take(1),
      map((entities) => {
        const applicants = Object.values(entities);
        return applicants.every(applicantHasNotesLoaded);
      })
    );
  }
}
