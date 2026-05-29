/** JSON list projection from Spring `ApplicantSummaryDto` (no notes). */
export interface ApplicantApiSummaryRecord {
  readonly id: string;
  readonly name?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly location?: string;
  readonly yearsOfExperience?: number;
  readonly applicationStatus?: string;
  readonly currentJobTitle?: string;
  /** ISO-8601 calendar date (`YYYY-MM-DD`). */
  readonly availableFrom?: string;
  readonly skills?: readonly string[];
}
