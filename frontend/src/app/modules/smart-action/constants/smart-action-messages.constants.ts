export const SMART_ACTION_FALLBACKS = {
  UNKNOWN_APPLICANT_LABEL: 'applicant',
} as const;

export const SMART_ACTION_MESSAGES = {
  APPLICANT_NOT_FOUND: (identifier: string) =>
    `No applicant found for "${identifier}".`,
  MOVED_APPLICANT_STATUS: (name: string, status: string) =>
    `Moved ${name} to ${status}.`,
  DELETED_APPLICANT: (name: string) => `Deleted ${name}.`,
  FILTER_RESULTS: (count: number) =>
    `Showing ${count} applicants matching your criteria.`,
  MATCH_JOB: 'Matching candidates for your job description.',
  EXPORT_DATA: (format: string) =>
    `Exporting ${format} and opening export page.`,
  GENERATE_REPORT: (reportType: string) => `Generated ${reportType} report.`,
  PARSE_FAILURE_PREFIX: 'Could not understand:',
  INVALID_PARSER_ACTION: 'Invalid action returned by parser',
  NOTHING_TO_UNDO: 'Nothing to undo.',
} as const;
