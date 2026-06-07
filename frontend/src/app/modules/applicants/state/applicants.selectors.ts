import { createSelector } from '@ngrx/store';

import {
  selectAllFromEntityCollection,
  selectEntityCollectionLoaded,
  selectEntityCollectionLoading,
} from '../../../core/entity-data/entity-cache.selectors';
import { RecruitaEntityNames } from '../../../core/entity-data/recruita-entity-names';
import { StateFeatures } from '../../../containers/root/enums/state-features.enum';
import { ApplicationStatus } from '../enums/application-status.enum';
import { SortDirection } from '../enums/sort-direction.enum';
import { ViewTypes } from '../enums/view-types.enum';
import { ApplicantUiState } from '../models/applicant-state.model';
import { Applicant } from '../models/applicant.model';
import { filterApplicantList } from '../utilities/applicant-filters.util';
import { countryFromLocation } from '../utilities/applicant-location.util';

const APPLICATION_STATUS_ORDER = Object.values(ApplicationStatus);
const EMPTY_APPLICANT_UI_STATE: ApplicantUiState = {
  filter: '',
  sortBy: 'name',
  sortDirection: SortDirection.Asc,
  filterBySkill: null,
  filterByStatus: null,
  filterByCountry: null,
  viewType: ViewTypes.GRID,
  locationSuggestions: [],
  newApplicantFabExpanded: false,
  suppressNewApplicantFabPointerExpandUntil: 0,
};

const selectApplicantUiState = (state: {
  [StateFeatures.Applicants]?: ApplicantUiState;
}): ApplicantUiState | undefined => state[StateFeatures.Applicants];

const selectApplicantUiStateSafe = createSelector(
  selectApplicantUiState,
  (state): ApplicantUiState => state ?? EMPTY_APPLICANT_UI_STATE
);

export const selectAllApplicants = selectAllFromEntityCollection<Applicant>(
  RecruitaEntityNames.Applicant
);

export const selectLoading = selectEntityCollectionLoading(
  RecruitaEntityNames.Applicant
);

export const selectApplicantsLoaded = selectEntityCollectionLoaded(
  RecruitaEntityNames.Applicant
);

export const selectApplicantsReady = createSelector(
  selectApplicantsLoaded,
  selectLoading,
  (loaded, loading) => loaded && !loading
);

export const selectViewType = createSelector(
  selectApplicantUiStateSafe,
  (state): ViewTypes => state.viewType
);

export const selectGlobalFilter = createSelector(
  selectApplicantUiStateSafe,
  (state): string => state.filter
);

export const selectFilterBySkill = createSelector(
  selectApplicantUiStateSafe,
  (state): string | null => state.filterBySkill
);

export const selectFilterByStatus = createSelector(
  selectApplicantUiStateSafe,
  (state): ApplicationStatus | null => state.filterByStatus
);

export const selectFilterByCountry = createSelector(
  selectApplicantUiStateSafe,
  (state): string | null => state.filterByCountry
);

export const selectUniqueApplicationStatuses = createSelector(
  selectAllApplicants,
  (applicants): ApplicationStatus[] => {
    const set = new Set<ApplicationStatus>();
    for (const a of applicants) {
      if (a.applicationStatus) {
        set.add(a.applicationStatus);
      }
    }
    return [...set].sort((a, b) => {
      const ia = APPLICATION_STATUS_ORDER.indexOf(a);
      const ib = APPLICATION_STATUS_ORDER.indexOf(b);
      const ra = ia === -1 ? 999 : ia;
      const rb = ib === -1 ? 999 : ib;
      if (ra !== rb) {
        return ra - rb;
      }
      return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });
  }
);

export const selectUniqueCountries = createSelector(
  selectAllApplicants,
  (applicants): string[] => {
    const set = new Set<string>();
    for (const a of applicants) {
      const c = countryFromLocation(a.location);
      if (c) {
        set.add(c);
      }
    }
    return [...set].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  }
);

export const selectLocationSuggestions = createSelector(
  selectApplicantUiStateSafe,
  (state): string[] => state.locationSuggestions ?? []
);

export const selectSortBy = createSelector(
  selectApplicantUiStateSafe,
  (state): keyof Applicant | null => state.sortBy
);

export const selectSortDirection = createSelector(
  selectApplicantUiStateSafe,
  (state): SortDirection => state.sortDirection ?? SortDirection.Asc
);

export const selectNewApplicantFabExpanded = createSelector(
  selectApplicantUiStateSafe,
  (state): boolean => state.newApplicantFabExpanded
);

export const selectSuppressNewApplicantFabPointerExpandUntil = createSelector(
  selectApplicantUiStateSafe,
  (state): number => state.suppressNewApplicantFabPointerExpandUntil
);

export { countryFromLocation } from '../utilities/applicant-location.util';

function compareApplicantValues(
  a: Applicant,
  b: Applicant,
  key: keyof Applicant
): number {
  const va = a[key];
  const vb = b[key];
  if (va === vb) {
    return 0;
  }
  if (va === undefined || va === null) {
    return vb === undefined || vb === null ? 0 : -1;
  }
  if (vb === undefined || vb === null) {
    return 1;
  }
  if (key === 'availableFrom') {
    const da = va instanceof Date ? va : new Date(va as string | number);
    const db = vb instanceof Date ? vb : new Date(vb as string | number);
    const ta = da.getTime();
    const tb = db.getTime();
    if (Number.isNaN(ta) && Number.isNaN(tb)) {
      return 0;
    }
    if (Number.isNaN(ta)) {
      return -1;
    }
    if (Number.isNaN(tb)) {
      return 1;
    }
    return ta - tb;
  }
  if (typeof va === 'number' && typeof vb === 'number') {
    return va - vb;
  }
  if (Array.isArray(va) || Array.isArray(vb)) {
    const sa = Array.isArray(va) ? va.join(', ') : String(va);
    const sb = Array.isArray(vb) ? vb.join(', ') : String(vb);
    return sa.localeCompare(sb, undefined, {
      sensitivity: 'base',
      numeric: true,
    });
  }
  return String(va).localeCompare(String(vb), undefined, {
    sensitivity: 'base',
    numeric: true,
  });
}

const applySorting = (
  applicants: Applicant[],
  sortBy: keyof Applicant | null,
  sortDirection: SortDirection
): Applicant[] => {
  if (!sortBy) {
    return applicants;
  }
  const mult = sortDirection === SortDirection.Desc ? -1 : 1;
  return [...applicants].sort(
    (a, b) => mult * compareApplicantValues(a, b, sortBy)
  );
};

const selectFilteredApplicants = createSelector(
  selectAllApplicants,
  selectGlobalFilter,
  selectFilterBySkill,
  selectFilterByStatus,
  selectFilterByCountry,
  (
    applicants,
    globalFilter,
    skillFilter,
    statusFilter,
    countryFilter
  ): Applicant[] =>
    filterApplicantList(applicants, {
      globalFilter,
      skill: skillFilter,
      status: statusFilter,
      country: countryFilter,
    })
);

export const selectSortedApplicants = createSelector(
  selectFilteredApplicants,
  selectSortBy,
  selectSortDirection,
  (filteredApplicants, sortBy, sortDirection): Applicant[] =>
    applySorting(filteredApplicants, sortBy, sortDirection)
);
