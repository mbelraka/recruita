import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { of, Subject } from 'rxjs';

import { Applicant } from '../models/applicant.model';
import * as ApplicantsActions from '../state/applicants.actions';
import { ApplicantApiService } from './applicant-api.service';
import { ApplicantEditDialogService } from './applicant-edit-dialog.service';

describe('ApplicantEditDialogService', () => {
  let service: ApplicantEditDialogService;
  let mockStore: jasmine.SpyObj<Store>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockApi: jasmine.SpyObj<ApplicantApiService>;
  let afterClosed$: Subject<unknown>;
  let destroyRef: DestroyRef;

  beforeEach(() => {
    afterClosed$ = new Subject<unknown>();
    mockStore = jasmine.createSpyObj('Store', ['dispatch']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialog.open.and.returnValue({
      afterClosed: () => afterClosed$.asObservable(),
    } as MatDialogRef<unknown>);
    mockApi = jasmine.createSpyObj<ApplicantApiService>('ApplicantApiService', [
      'getById',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ApplicantEditDialogService,
        { provide: Store, useValue: mockStore },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ApplicantApiService, useValue: mockApi },
      ],
    });

    service = TestBed.inject(ApplicantEditDialogService);
    destroyRef = TestBed.inject(DestroyRef);
  });

  it('opens create dialog without calling the detail API', () => {
    const onClosed = jasmine.createSpy('onClosed');
    service.openCreateOrEdit(destroyRef, undefined, onClosed);

    expect(mockApi.getById).not.toHaveBeenCalled();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('dispatches addApplicant when create dialog closes with a new applicant', () => {
    service.openCreateOrEdit(destroyRef, undefined, () => undefined);
    const created = new Applicant({ id: 'new', name: 'Sam', skills: ['Go'] });
    afterClosed$.next(created);

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      ApplicantsActions.addApplicant({ applicant: created })
    );
  });

  it('loads detail before opening the edit dialog', () => {
    const listApplicant = new Applicant({
      id: '1',
      name: 'John',
      skills: ['Go'],
    });
    const detailed = new Applicant({
      id: '1',
      name: 'John',
      notes: 'detail',
      skills: ['Go'],
    });
    mockApi.getById.and.returnValue(of(detailed));

    service.openCreateOrEdit(destroyRef, listApplicant, () => undefined);

    expect(mockApi.getById).toHaveBeenCalledWith('1');
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      ApplicantsActions.loadApplicantDetailSuccess({ applicant: detailed })
    );
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('dispatches updateApplicant when edit dialog closes with an update result', () => {
    service.openCreateOrEdit(destroyRef, undefined, () => undefined);
    const updated = new Applicant({
      id: '1',
      name: 'John Updated',
      skills: ['Go'],
    });
    afterClosed$.next({ applicant: updated, isUpdate: true });

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      ApplicantsActions.updateApplicant({ applicant: updated })
    );
  });
});
