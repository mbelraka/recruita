import { signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

import { SortDirection } from '../modules/applicants/enums/sort-direction.enum';
import { Applicant } from '../modules/applicants/models/applicant.model';
import * as Selectors from '../modules/applicants/state/applicants.selectors';

export function mockApplicantViewSelectSignals(
  mockStore: jasmine.SpyObj<Store>,
  options: {
    applicants?: Applicant[];
    globalFilter?: string;
    activeSkillFilter?: string | null;
    filterByStatus?: string | null;
    filterByCountry?: string | null;
    sortBy?: keyof Applicant | null;
    sortDirection?: SortDirection;
  } = {}
): void {
  const activeSkillFilter = options.activeSkillFilter ?? null;

  (mockStore.selectSignal as jasmine.Spy).and.callFake((selector: unknown) => {
    if (selector === Selectors.selectSortedApplicants) {
      return signal(options.applicants ?? []);
    }
    if (selector === Selectors.selectGlobalFilter) {
      return signal(options.globalFilter ?? '');
    }
    if (selector === Selectors.selectFilterBySkill) {
      return signal(activeSkillFilter);
    }
    if (selector === Selectors.selectFilterByStatus) {
      return signal(options.filterByStatus ?? null);
    }
    if (selector === Selectors.selectFilterByCountry) {
      return signal(options.filterByCountry ?? null);
    }
    if (selector === Selectors.selectSortBy) {
      return signal(options.sortBy ?? null);
    }
    if (selector === Selectors.selectSortDirection) {
      return signal(options.sortDirection ?? SortDirection.Asc);
    }
    return signal(null);
  });

  if (mockStore.select) {
    (mockStore.select as jasmine.Spy).and.callFake((selector: unknown) => {
      if (selector === Selectors.selectFilterBySkill) {
        return of(activeSkillFilter);
      }
      return of(null);
    });
  }
}
