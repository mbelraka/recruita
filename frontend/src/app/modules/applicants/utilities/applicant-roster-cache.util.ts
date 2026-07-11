import { Applicant } from '../models/applicant.model';

/** Keeps cached notes when a summary roster refresh omits that field. */
export function mergeApplicantsPreservingNotes(
  incoming: readonly Applicant[],
  existing: readonly Applicant[]
): Applicant[] {
  const existingById = new Map(
    existing.map((applicant) => [applicant.id, applicant])
  );
  return incoming.map((applicant) => {
    const previous = existingById.get(applicant.id);
    if (previous?.notes !== undefined && applicant.notes === undefined) {
      return { ...applicant, notes: previous.notes };
    }
    return applicant;
  });
}

export function applicantHasNotesLoaded(applicant: Applicant): boolean {
  return applicant.notes !== undefined;
}
