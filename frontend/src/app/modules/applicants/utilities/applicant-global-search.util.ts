import { Applicant } from '../models/applicant.model';

/** Text fields matched by the applicants list global search (summary roster fields). */
export function applicantGlobalSearchHaystack(applicant: Applicant): string {
  const avail = applicant.availableFrom;
  let availStr = '';
  if (avail !== undefined && avail !== null) {
    const d =
      avail instanceof Date ? avail : new Date(avail as string | number);
    if (!Number.isNaN(d.getTime())) {
      availStr = `${d.toISOString().slice(0, 10)} ${d.toLocaleDateString()}`;
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
    (applicant.skills ?? []).join(' '),
    availStr,
    // Notes are not on the summary API; only searchable after detail is cached (e.g. edit).
    ...(notes ? [notes] : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
