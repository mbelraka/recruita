import { Applicant } from '../models/applicant.model';

/** Result of a conditional roster GET (`If-None-Match` / ETag). */
export interface ApplicantRosterLoadResult {
  readonly applicants: Applicant[] | null;
  readonly notModified: boolean;
  readonly etag: string | null;
  readonly rosterVersion: number | null;
}
