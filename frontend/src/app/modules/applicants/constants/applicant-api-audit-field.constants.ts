/** Server-managed timestamps omitted from POST/PUT applicant bodies. */
export const APPLICANT_API_AUDIT_FIELD = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

export type ApplicantApiAuditField =
  (typeof APPLICANT_API_AUDIT_FIELD)[keyof typeof APPLICANT_API_AUDIT_FIELD];
