import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { firstValueFrom, of, ReplaySubject, throwError } from 'rxjs';

import { Applicant } from '../models/applicant.model';
import { ApplicantApiService } from '../services/applicant-api.service';
import { CitySearchService } from '../services/city-search.service';
import {
  addApplicant,
  addApplicantFailure,
  addApplicantSuccess,
  deleteApplicant,
  deleteApplicantFailure,
  loadApplicants,
  loadApplicantsFailure,
  loadApplicantsSuccess,
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
  let api: jasmine.SpyObj<ApplicantApiService>;

  const sample = new Applicant({
    id: 'a-1',
    name: 'Alex',
    email: 'alex@example.com',
    phone: '+1',
    skills: ['Angular'],
  });

  beforeEach(() => {
    actions$ = new ReplaySubject(1);
    api = jasmine.createSpyObj<ApplicantApiService>('ApplicantApiService', [
      'list',
      'create',
      'update',
      'delete',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ApplicantsEffects,
        provideMockActions(() => actions$),
        { provide: ApplicantApiService, useValue: api },
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

  it('loads applicants from the API', async () => {
    api.list.and.returnValue(of([sample]));
    actions$.next(loadApplicants());

    const action = await firstValueFrom(effects.loadApplicants$);
    expect(action).toEqual(loadApplicantsSuccess({ applicants: [sample] }));
  });

  it('dispatches loadApplicantsFailure when the API fails', async () => {
    api.list.and.returnValue(throwError(() => new Error('offline')));
    actions$.next(loadApplicants());

    const action = await firstValueFrom(effects.loadApplicants$);
    expect(action).toEqual(loadApplicantsFailure({ error: 'offline' }));
  });

  it('creates an applicant from the API response without refetching the roster', async () => {
    api.create.and.returnValue(of(sample));
    actions$.next(addApplicant({ applicant: sample }));

    const action = await firstValueFrom(effects.addApplicant$);
    expect(api.create).toHaveBeenCalledWith(sample);
    expect(api.list).not.toHaveBeenCalled();
    expect(action).toEqual(addApplicantSuccess({ applicant: sample }));
  });

  it('dispatches addApplicantFailure when create fails', async () => {
    api.create.and.returnValue(throwError(() => new Error('create failed')));
    actions$.next(addApplicant({ applicant: sample }));

    const action = await firstValueFrom(effects.addApplicant$);
    expect(action).toEqual(addApplicantFailure({ error: 'create failed' }));
  });

  it('dispatches updateApplicantFailure when update fails', async () => {
    api.update.and.returnValue(
      throwError(() => new Error('Applicant not found.'))
    );
    actions$.next(updateApplicant({ applicant: sample }));

    const action = await firstValueFrom(effects.updateApplicant$);
    expect(action).toEqual(
      updateApplicantFailure({ error: 'Applicant not found.' })
    );
  });

  it('dispatches deleteApplicantFailure when delete fails', async () => {
    api.delete.and.returnValue(throwError(() => new Error('delete failed')));
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
