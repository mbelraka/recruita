import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { createApplicant } from './applicant-domain.util';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import { FullState } from 'src/app/models/full-state.model';
import * as ApplicantsActions from '../state/applicants.actions';
import { confirmDeleteApplicant } from './confirm-delete.util';

describe('confirmDeleteApplicant', () => {
  let dialog: jasmine.SpyObj<MatDialog>;
  let store: jasmine.SpyObj<Store<FullState>>;
  let afterClosed$: Subject<boolean | undefined>;

  const applicant = createApplicant({
    id: 'candidate-1',
    name: '  John Doe  ',
    currentJobTitle: '  Frontend Engineer  ',
  });

  beforeEach(() => {
    afterClosed$ = new Subject<boolean | undefined>();
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    store = jasmine.createSpyObj<Store<FullState>>('Store', ['dispatch']);

    const dialogRef = {
      afterClosed: (): Subject<boolean | undefined> => afterClosed$,
    } as unknown as MatDialogRef<unknown, boolean | undefined>;

    dialog.open.and.returnValue(dialogRef);
  });

  it('should open the dialog with trimmed candidate data', () => {
    confirmDeleteApplicant(dialog, store, applicant);

    expect(dialog.open).toHaveBeenCalled();
    expect(dialog.open.calls.mostRecent().args[1]).toEqual(
      jasmine.objectContaining({
        data: {
          candidateName: 'John Doe',
          jobTitle: 'Frontend Engineer',
        },
      })
    );
  });

  it('should dispatch deleteApplicant when the dialog confirms', () => {
    confirmDeleteApplicant(dialog, store, applicant);

    afterClosed$.next(true);

    expect(store.dispatch).toHaveBeenCalledWith(
      ApplicantsActions.deleteApplicant({ id: 'candidate-1' })
    );
  });

  it('should not dispatch when the dialog returns false', () => {
    confirmDeleteApplicant(dialog, store, applicant);

    afterClosed$.next(false);

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should not dispatch when the dialog closes without a result', () => {
    confirmDeleteApplicant(dialog, store, applicant);

    afterClosed$.next(undefined);

    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should fall back to an em dash and omit a blank job title', () => {
    const applicantWithoutLabels = createApplicant({
      id: 'candidate-2',
      name: '   ',
      currentJobTitle: '   ',
    });

    confirmDeleteApplicant(dialog, store, applicantWithoutLabels);

    expect(dialog.open.calls.mostRecent().args[1]).toEqual(
      jasmine.objectContaining({
        data: {
          candidateName: '—',
          jobTitle: undefined,
        },
      })
    );
  });
});
