import { Applicant } from '../models/applicant.model';
import { APP_CONFIG } from '../../../config/app.config';
import { APPLICANT } from '../constants/applicant.constants';

/** Text fields matched by the applicants list global search (summary roster fields). */
export function applicantGlobalSearchHaystack(applicant: Applicant): string {
  const avail = applicant.availableFrom;
  let availStr = '';
  if (avail !== undefined && avail !== null) {
    const d =
      avail instanceof Date ? avail : new Date(avail as string | number);
    if (!Number.isNaN(d.getTime())) {
      availStr = `${d.toISOString().slice(0, APP_CONFIG.EXPORT.CSV.DATE_SLICE_END_INDEX)} ${d.toLocaleDateString()}`;
    }
  }

  const notes = applicant.notes?.trim();

  return [
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
    (applicant.skills ?? []).join(APPLICANT.NAME_PART_SEPARATOR),
    availStr,
    // Notes are not on the summary API; only searchable after detail is cached (e.g. edit).
    ...(notes ? [notes] : []),
  ]
    .filter(Boolean)
    .join(APPLICANT.NAME_PART_SEPARATOR)
    .toLowerCase();
}
