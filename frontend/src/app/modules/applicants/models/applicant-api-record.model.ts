import { ApplicantApiSummaryRecord } from './applicant-api-summary-record.model';

/** JSON detail shape from Spring `ApplicantDto` (camelCase). */
export interface ApplicantApiRecord extends ApplicantApiSummaryRecord {
  readonly notes?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}
