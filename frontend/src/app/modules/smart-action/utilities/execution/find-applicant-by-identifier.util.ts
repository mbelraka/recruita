import { Observable, map, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { FullState } from '../../../../models/full-state.model';
import { Applicant } from '../../../applicants/models/applicant.model';
import { selectAllApplicants } from '../../../applicants/state/applicants.selectors';

export function findApplicantByIdentifier(
  store: Store<FullState>,
  identifier: string
): Observable<Applicant | null> {
  const normalized = identifier.trim().toLowerCase();
  return store.select(selectAllApplicants).pipe(
    take(1),
    map(
      (entities) =>
        entities.find(
          (a) =>
            a.id === identifier ||
            a.email?.toLowerCase() === normalized ||
            a.name?.toLowerCase() === normalized
        ) ?? null
    )
  );
}
