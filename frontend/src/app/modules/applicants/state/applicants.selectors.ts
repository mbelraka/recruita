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

/** Country segment from `location` (last comma-separated part, or whole string). */
export function countryFromLocation(
  location: string | undefined
): string | null {
  const raw = location?.trim();
  if (!raw) {
    return null;
  }
  const parts = raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  return parts[parts.length - 1] ?? null;
}

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

const applyFilters = (
  applicants: Applicant[],
  globalFilter: string,
  skillFilter: string | null,
  statusFilter: string | null,
  countryFilter: string | null
): Applicant[] => {
  let filtered = applicants;
  if (skillFilter) {
    filtered = filtered.filter(
      (applicant: Applicant): boolean =>
        applicant.skills?.includes(skillFilter) ?? false
    );
  }
  if (statusFilter) {
    filtered = filtered.filter(
      (applicant: Applicant): boolean =>
        applicant.applicationStatus === statusFilter
    );
  }
  if (countryFilter) {
    filtered = filtered.filter(
      (applicant: Applicant): boolean =>
        countryFromLocation(applicant.location) === countryFilter
    );
  }
  const q = globalFilter.trim().toLowerCase();
  if (q.length > 0) {
    filtered = filtered.filter((applicant: Applicant): boolean => {
      const avail = applicant.availableFrom;
      let availStr = '';
      if (avail !== undefined && avail !== null) {
        const d =
          avail instanceof Date ? avail : new Date(avail as string | number);
        if (!Number.isNaN(d.getTime())) {
          availStr = `${d.toISOString().slice(0, 10)} ${d.toLocaleDateString()}`;
        }
      }
      const haystack = [
        applicant.name,
        applicant.email,
        applicant.phone,
        applicant.location,
        applicant.currentJobTitle,
        applicant.applicationStatus,
        applicant.yearsOfExperience !== undefined &&
        applicant.yearsOfExperience !== null
          ? String(applicant.yearsOfExperience)
          : '',
        applicant.notes,
        (applicant.skills ?? []).join(' '),
        availStr,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }
  return filtered;
};

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
    applyFilters(
      applicants,
      globalFilter,
      skillFilter,
      statusFilter,
      countryFilter
    )
);

export const selectSortedApplicants = createSelector(
  selectFilteredApplicants,
  selectSortBy,
  selectSortDirection,
  (filteredApplicants, sortBy, sortDirection): Applicant[] =>
    applySorting(filteredApplicants, sortBy, sortDirection)
);
