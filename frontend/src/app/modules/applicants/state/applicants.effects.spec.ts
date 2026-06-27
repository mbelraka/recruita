import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { createApplicant } from '../utilities/applicant-domain.util';
import { DataServiceError } from '@ngrx/data';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import {
  defaultIfEmpty,
  firstValueFrom,
  of,
  ReplaySubject,
  Subject,
  throwError,
} from 'rxjs';

import { NOTIFICATION_MESSAGE_KEYS } from '../../../constants/notification-message-keys';
import { HttpStatusCode } from '../../../enums/http-status-code.enum';
import { HttpApiError } from '../../../models/http-api-error.model';
import { ApplicantEntityCollectionService } from '../data/applicant-entity-collection.service';
import { ApplicantEditDialogService } from '../services/applicant-edit-dialog.service';
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
  openApplicantForm,
  updateApplicant,
  updateApplicantFailure,
} from './applicants.actions';
import { ApplicantsEffects } from './applicants.effects';
import { invalidateMatchResults } from '../../match/state/match.actions';

describe('ApplicantsEffects', () => {
  let actions$: ReplaySubject<unknown>;
  let effects: ApplicantsEffects;
  let collection: jasmine.SpyObj<ApplicantEntityCollectionService>;
  let routerEvents$: Subject<NavigationEnd>;
  let mockRouter: {
    events: Subject<NavigationEnd>;
    url: string;
    routerState: {
      root: {
        firstChild: null;
        snapshot: { queryParamMap: { get: () => null } };
      };
    };
  };
  let mockEditDialog: jasmine.SpyObj<ApplicantEditDialogService>;

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

    routerEvents$ = new Subject<NavigationEnd>();
    mockRouter = {
      events: routerEvents$,
      url: '/applicants',
      routerState: {
        root: {
          firstChild: null,
          snapshot: { queryParamMap: { get: () => null } },
        },
      },
    };
    mockEditDialog = jasmine.createSpyObj<ApplicantEditDialogService>(
      'ApplicantEditDialogService',
      ['openCreateOrEdit']
    );

    TestBed.configureTestingModule({
      providers: [
        ApplicantsEffects,
        provideMockActions(() => actions$),
        { provide: ApplicantEntityCollectionService, useValue: collection },
        provideMockStore(),
        { provide: Router, useValue: mockRouter },
        { provide: ApplicantEditDialogService, useValue: mockEditDialog },
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
      throwError(() => new Error('update failed'))
    );
    actions$.next(updateApplicant({ applicant: sample }));

    const action = await firstValueFrom(effects.updateApplicant$);
    expect(action).toEqual(updateApplicantFailure({ error: 'update failed' }));
  });

  it('shows the localized not-found toast on a 404 update failure', () => {
    collection.update.and.returnValue(
      throwError(
        () =>
          new DataServiceError(
            new HttpApiError('Applicant not found.', HttpStatusCode.NotFound),
            null
          )
      )
    );
    actions$.next(updateApplicant({ applicant: sample }));

    const emitted: unknown[] = [];
    const subscription = effects.updateApplicant$.subscribe((action) =>
      emitted.push(action)
    );

    expect(emitted[0]).toEqual(
      updateApplicantFailure({ error: 'Applicant not found.' })
    );
    expect(emitted[1]).toEqual(
      jasmine.objectContaining({
        notification: jasmine.objectContaining({
          messageKey: NOTIFICATION_MESSAGE_KEYS.applicantNotFound,
        }),
      })
    );
    subscription.unsubscribe();
  });

  it('dispatches deleteApplicantFailure when delete fails', async () => {
    collection.delete.and.returnValue(
      throwError(() => new Error('delete failed'))
    );
    actions$.next(deleteApplicant({ id: sample.id }));

    const action = await firstValueFrom(effects.deleteApplicant$);
    expect(action).toEqual(deleteApplicantFailure({ error: 'delete failed' }));
  });

  it('opens the applicant form dialog from NgRx', async () => {
    actions$.next(openApplicantForm({ applicant: sample }));

    await firstValueFrom(
      effects.openApplicantForm$.pipe(defaultIfEmpty(undefined))
    );
    expect(mockEditDialog.openCreateOrEdit).toHaveBeenCalledWith(sample);
  });

  it('invalidates match results after a successful applicant mutation', async () => {
    actions$.next(addApplicantSuccess({ applicant: sample }));

    const action = await firstValueFrom(
      effects.invalidateMatchOnApplicantChange$
    );
    expect(action).toEqual(invalidateMatchResults());
  });
});
