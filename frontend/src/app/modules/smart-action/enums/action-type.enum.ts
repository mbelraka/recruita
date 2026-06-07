/** Wire values sent by the LLM and validated before execution. */
export enum ActionType {
  FilterApplicants = 'FILTER_APPLICANTS',
  UpdateStatus = 'UPDATE_STATUS',
  ExportData = 'EXPORT_DATA',
  CreateApplicant = 'CREATE_APPLICANT',
  DeleteApplicant = 'DELETE_APPLICANT',
  GenerateReport = 'GENERATE_REPORT',
  MatchJob = 'MATCH_JOB',
  BulkUpdate = 'BULK_UPDATE',
  Clarify = 'CLARIFY',
}
