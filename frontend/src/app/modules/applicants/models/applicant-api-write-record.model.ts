import { ApplicantApiAuditField } from '../constants/applicant-api-audit-field.constants';
import { ApplicantApiRecord } from './applicant-api-record.model';

/** Request body for POST/PUT `/api/applicants`. */
export type ApplicantApiWriteRecord = Omit<
  ApplicantApiRecord,
  ApplicantApiAuditField
>;
