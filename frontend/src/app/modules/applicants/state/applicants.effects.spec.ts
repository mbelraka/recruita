import { TestBed } from '@angular/core/testing';
import { createApplicant } from '../utilities/applicant-domain.util';
import { provideMockActions } from '@ngrx/effects/testing';
import { firstValueFrom, of, ReplaySubject, throwError } from 'rxjs';

import { ApplicantEntityCollectionService } from '../data/applicant-entity-collection.service';
import { CitySearchService } from '../services/city-search.service';
import {
  addApplicant,
  addApplicantFailure,
  addApplicantSuccess,
  applicantsRosterLoaded,
  deleteApplicant,
  deleteApplicantFailure,
  loadApplicants,
  loadApplicantsFailure,
  updateApplicant,
  updateApplicantFailure,
} from './applicants.actions';
import { ApplicantsEffects } from './applicants.effects';
import { invalidateMatchResults } from '../../match/state/match.actions';

describe('ApplicantsEffects', () => {
  let actions$: ReplaySubject<
    ReturnType<
      | typeof loadApplicants
      | typeof addApplicant
      | typeof addApplicantSuccess
      | typeof updateApplicant
      | typeof deleteApplicant
    >
  >;
  let effects: ApplicantsEffects;
  let collection: jasmine.SpyObj<ApplicantEntityCollectionService>;

  const sample = createApplicant({
    id: 'a-1',
    name: 'Alex',
    email: 'alex@example.com',
    phone: '+1',
    skills: ['Angular'],
  });

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    collection = jasmine.createSpyObj<ApplicantEntityCollectionService>(
      'ApplicantEntityCollectionService',
      ['loadRoster', 'add', 'update', 'delete']
    );

    TestBed.configureTestingModule({
      providers: [
        ApplicantsEffects,
        provideMockActions(() => actions$),
        { provide: ApplicantEntityCollectionService, useValue: collection },
        {
          provide: CitySearchService,
          useValue: jasmine.createSpyObj<CitySearchService>(
            'CitySearchService',
            ['searchCityLabels']
          ),
        },
      ],
    });

    effects = TestBed.inject(ApplicantsEffects);
  });

  it('loads applicants through NgRx Data', async () => {
    collection.loadRoster.and.returnValue(of([sample]));
    actions$.next(loadApplicants());

    const action = await firstValueFrom(effects.loadApplicants$);
    expect(action).toEqual(applicantsRosterLoaded());
  });

  it('dispatches loadApplicantsFailure when the API fails', async () => {
    collection.loadRoster.and.returnValue(
      throwError(() => new Error('offline'))
    );
    actions$.next(loadApplicants());

    const action = await firstValueFrom(effects.loadApplicants$);
    expect(action).toEqual(loadApplicantsFailure({ error: 'offline' }));
  });

  it('creates an applicant from the collection response without refetching the roster', async () => {
    collection.add.and.returnValue(of(sample));
    actions$.next(addApplicant({ applicant: sample }));

    const action = await firstValueFrom(effects.addApplicant$);
    expect(collection.add).toHaveBeenCalledWith(sample);
    expect(collection.loadRoster).not.toHaveBeenCalled();
    expect(action).toEqual(addApplicantSuccess({ applicant: sample }));
  });

  it('dispatches addApplicantFailure when create fails', async () => {
    collection.add.and.returnValue(
      throwError(() => new Error('create failed'))
    );
    actions$.next(addApplicant({ applicant: sample }));

    const action = await firstValueFrom(effects.addApplicant$);
    expect(action).toEqual(addApplicantFailure({ error: 'create failed' }));
  });

  it('dispatches updateApplicantFailure when update fails', async () => {
    collection.update.and.returnValue(
      throwError(() => new Error('Applicant not found.'))
    );
    actions$.next(updateApplicant({ applicant: sample }));

    const action = await firstValueFrom(effects.updateApplicant$);
    expect(action).toEqual(
      updateApplicantFailure({ error: 'Applicant not found.' })
    );
  });

  it('dispatches deleteApplicantFailure when delete fails', async () => {
    collection.delete.and.returnValue(
      throwError(() => new Error('delete failed'))
    );
    actions$.next(deleteApplicant({ id: sample.id }));

    const action = await firstValueFrom(effects.deleteApplicant$);
    expect(action).toEqual(deleteApplicantFailure({ error: 'delete failed' }));
  });

  it('invalidates match results after a successful applicant mutation', async () => {
    actions$.next(addApplicantSuccess({ applicant: sample }));

    const action = await firstValueFrom(
      effects.invalidateMatchOnApplicantChange$
    );
    expect(action).toEqual(invalidateMatchResults());
  });
});
