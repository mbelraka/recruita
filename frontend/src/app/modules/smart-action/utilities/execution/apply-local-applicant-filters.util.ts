import { Applicant } from '../../../applicants/models/applicant.model';
import {
  buildApplicantListFiltersFromSmartAction,
  filterApplicantList,
} from '../../../applicants/utilities/applicant-filters.util';
import { FilterParams } from '../../models/filter-params.interface';

export function applyLocalApplicantFilters(
  applicants: readonly Applicant[],
  params: FilterParams
): Applicant[] {
  const filters = buildApplicantListFiltersFromSmartAction(params, applicants);
  return filterApplicantList(applicants, filters);
}
