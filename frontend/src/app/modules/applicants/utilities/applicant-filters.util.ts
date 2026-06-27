import { ParamMap, Params, Router } from '@angular/router';

import { APP_CONFIG } from '../../../config/app.config';
import { ApplicationStatus } from '../enums/application-status.enum';
import { ApplicantFilterQueryParam } from '../enums/applicant-filter-query-param.enum';
import { Applicant } from '../models/applicant.model';
import { applicantGlobalSearchHaystack } from './applicant-global-search.util';
import { countryFromLocation } from './applicant-location.util';
import { isApplicationStatus } from './application-status.util';
import {
  canonicalizeRosterCountry,
  canonicalizeRosterSkill,
  canonicalizeRosterStatus,
} from './roster.util';

export interface ApplicantListFilters {
  readonly globalFilter: string;
  readonly skill: string | null;
  readonly status: ApplicationStatus | null;
  readonly country: string | null;
  readonly minExperience?: number;
  readonly maxExperience?: number;
}

export const EMPTY_APPLICANT_LIST_FILTERS: ApplicantListFilters = {
  globalFilter: '',
  skill: null,
  status: null,
  country: null,
};

export function parseApplicantFiltersFromQueryParams(
  paramMap: ParamMap
): ApplicantListFilters {
  const statusRaw = paramMap.get(ApplicantFilterQueryParam.Status);
  const status = statusRaw && isApplicationStatus(statusRaw) ? statusRaw : null;

  return {
    globalFilter: paramMap.get(ApplicantFilterQueryParam.Search) ?? '',
    skill: paramMap.get(ApplicantFilterQueryParam.Skill),
    status,
    country: paramMap.get(ApplicantFilterQueryParam.Country),
  };
}

export function buildApplicantFilterQueryParams(
  filters: ApplicantListFilters
): Params {
  const search = filters.globalFilter.trim();
  return {
    [ApplicantFilterQueryParam.Search]: search.length > 0 ? search : null,
    [ApplicantFilterQueryParam.Skill]: filters.skill || null,
    [ApplicantFilterQueryParam.Status]: filters.status || null,
    [ApplicantFilterQueryParam.Country]: filters.country || null,
  };
}

export function mergeApplicantListFilters(
  current: ApplicantListFilters,
  partial: Partial<ApplicantListFilters>
): ApplicantListFilters {
  return {
    globalFilter:
      partial.globalFilter === undefined
        ? current.globalFilter
        : partial.globalFilter,
    skill: partial.skill === undefined ? current.skill : partial.skill,
    status: partial.status === undefined ? current.status : partial.status,
    country: partial.country === undefined ? current.country : partial.country,
    minExperience: partial.minExperience,
    maxExperience: partial.maxExperience,
  };
}

export function navigateApplicantFiltersUrl(
  router: Router,
  filters: ApplicantListFilters
): Promise<boolean> {
  return router.navigate([APP_CONFIG.ROUTES.APPLICANTS], {
    queryParams: buildApplicantFilterQueryParams(filters),
    queryParamsHandling: 'merge',
    replaceUrl: true,
  });
}

/** Maps LLM-parsed filter params to applicants list state without re-interpreting intent. */
export function buildApplicantListFiltersFromSmartAction(
  params: {
    readonly skills?: readonly string[];
    readonly minExperience?: number;
    readonly maxExperience?: number;
    readonly status?: ApplicationStatus | string;
    readonly country?: string;
    readonly location?: string;
    readonly searchTerm?: string;
  },
  applicants: readonly Applicant[]
): ApplicantListFilters {
  const countryInput = params.country?.trim() || params.location?.trim() || '';
  const skillInput = params.skills?.[0]?.trim() || '';

  return {
    globalFilter: params.searchTerm?.trim() ?? '',
    skill: skillInput ? canonicalizeRosterSkill(skillInput, applicants) : null,
    status: canonicalizeRosterStatus(params.status),
    country: countryInput
      ? canonicalizeRosterCountry(countryInput, applicants)
      : null,
    minExperience: params.minExperience,
    maxExperience: params.maxExperience,
  };
}

export function filterApplicantList(
  applicants: readonly Applicant[],
  filters: ApplicantListFilters
): Applicant[] {
  let filtered = [...applicants];

  if (filters.skill) {
    filtered = filtered.filter(
      (applicant) => applicant.skills?.includes(filters.skill!) ?? false
    );
  }

  if (filters.status) {
    filtered = filtered.filter(
      (applicant) => applicant.applicationStatus === filters.status
    );
  }

  if (filters.country) {
    filtered = filtered.filter(
      (applicant) => countryFromLocation(applicant.location) === filters.country
    );
  }

  const query = filters.globalFilter.trim().toLowerCase();
  if (query.length > 0) {
    filtered = filtered.filter((applicant) =>
      applicantGlobalSearchHaystack(applicant).includes(query)
    );
  }

  if (filters.minExperience !== undefined) {
    filtered = filtered.filter(
      (applicant) =>
        (applicant.yearsOfExperience ??
          APP_CONFIG.SMART_ACTION.VALIDATION.MIN_EXPERIENCE) >=
        filters.minExperience!
    );
  }

  if (filters.maxExperience !== undefined) {
    filtered = filtered.filter(
      (applicant) =>
        (applicant.yearsOfExperience ??
          APP_CONFIG.SMART_ACTION.VALIDATION.MIN_EXPERIENCE) <=
        filters.maxExperience!
    );
  }

  return filtered;
}
