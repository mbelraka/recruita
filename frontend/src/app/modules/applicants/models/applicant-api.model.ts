/** JSON shape returned by Spring `ApplicantDto` (camelCase). */
export interface ApplicantApiRecord {
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
  readonly notes?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

/** Request body for POST/PUT `/api/applicants`. */
export type ApplicantApiWriteRecord = Omit<
  ApplicantApiRecord,
  'createdAt' | 'updatedAt'
>;
