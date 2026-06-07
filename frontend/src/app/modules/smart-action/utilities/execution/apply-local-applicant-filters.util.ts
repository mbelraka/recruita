import { APP_CONFIG } from '../../../../config/app.config';
import { Applicant } from '../../../applicants/models/applicant.model';
import { FilterParams } from '../../models/filter-params.interface';

export function applyLocalApplicantFilters(
  applicants: readonly Applicant[],
  params: FilterParams
): Applicant[] {
  return applicants.filter((applicant) => {
    if (params.status && applicant.applicationStatus !== params.status) {
      return false;
    }
    if (params.skills?.length) {
      const hasSkill = params.skills.some((skill) =>
        applicant.skills?.some((s) => s.toLowerCase() === skill.toLowerCase())
      );
      if (!hasSkill) {
        return false;
      }
    }
    if (
      params.minExperience !== undefined &&
      (applicant.yearsOfExperience ??
        APP_CONFIG.SMART_ACTION.VALIDATION.MIN_EXPERIENCE) <
        params.minExperience
    ) {
      return false;
    }
    if (
      params.maxExperience !== undefined &&
      (applicant.yearsOfExperience ??
        APP_CONFIG.SMART_ACTION.VALIDATION.MIN_EXPERIENCE) >
        params.maxExperience
    ) {
      return false;
    }
    if (params.location) {
      const loc = applicant.location?.toLowerCase() ?? '';
      if (!loc.includes(params.location.toLowerCase())) {
        return false;
      }
    }
    if (params.searchTerm) {
      const hay = [
        applicant.name,
        applicant.email,
        applicant.currentJobTitle,
        applicant.notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!hay.includes(params.searchTerm.toLowerCase())) {
        return false;
      }
    }
    return true;
  });
}
