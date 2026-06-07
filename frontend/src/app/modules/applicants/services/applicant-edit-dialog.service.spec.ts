import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { of, Subject } from 'rxjs';

import { APP_CONFIG } from '../../../config/app.config';
import { createApplicant } from '../utilities/applicant-domain.util';
import * as ApplicantsActions from '../state/applicants.actions';
import { ApplicantEntityCollectionService } from '../data/applicant-entity-collection.service';
import { ApplicantEditDialogService } from './applicant-edit-dialog.service';

describe('ApplicantEditDialogService', () => {
  let service: ApplicantEditDialogService;
  let mockStore: jasmine.SpyObj<Store>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockCollection: jasmine.SpyObj<ApplicantEntityCollectionService>;
  let afterClosed$: Subject<unknown>;

  beforeEach(() => {
    afterClosed$ = new Subject<unknown>();
    mockStore = jasmine.createSpyObj('Store', ['dispatch']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialog.open.and.returnValue({
      afterClosed: () => afterClosed$.asObservable(),
    } as MatDialogRef<unknown>);
    mockCollection = jasmine.createSpyObj<ApplicantEntityCollectionService>(
      'ApplicantEntityCollectionService',
      ['getByKey']
    );

    TestBed.configureTestingModule({
      providers: [
        ApplicantEditDialogService,
        { provide: Store, useValue: mockStore },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ApplicantEntityCollectionService, useValue: mockCollection },
      ],
    });

    service = TestBed.inject(ApplicantEditDialogService);
  });

  it('opens create dialog without calling the detail API', () => {
    service.openCreateOrEdit(undefined);

    expect(mockCollection.getByKey).not.toHaveBeenCalled();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('dispatches applicantFormDialogClosed and addApplicant when create dialog closes', () => {
    spyOn(performance, 'now').and.returnValue(1000);
    service.openCreateOrEdit(undefined);
    const created = createApplicant({ id: 'new', name: 'Sam', skills: ['Go'] });
    afterClosed$.next(created);

    expect(mockStore.dispatch).toHaveBeenCalledWith(
      ApplicantsActions.applicantFormDialogClosed({
        suppressPointerExpandUntil:
          1000 +
          APP_CONFIG.APPLICANTS
            .NEW_APPLICANT_FAB_SUPPRESS_POINTER_EXPAND_AFTER_DIALOG_MS,
      })
    );
    expect(mockStore.dispatch).toHaveBeenCalledWith(
      ApplicantsActions.addApplicant({ applicant: created })
    );
  });

  it('loads detail before opening the edit dialog', () => {
    const listApplicant = createApplicant({
      id: '1',
      name: 'John',
      skills: ['Go'],
    });
    const detailed = createApplicant({
      id: '1',
      name: 'John',
      notes: 'detail',
      skills: ['Go'],
    });
    mockCollection.getByKey.and.returnValue(of(detailed));

    service.openCreateOrEdit(listApplicant);

    expect(mockCollection.getByKey).toHaveBeenCalledWith('1');
    expect(mockStore.dispatch).not.toHaveBeenCalled();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('dispatches updateApplicant when edit dialog closes with an update result', () => {
    service.openCreateOrEdit(undefined);
    const updated = createApplicant({
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
