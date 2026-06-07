import { BulkUpdateAction } from './bulk-update-action.type';
import { CreateApplicantAction } from './create-applicant-action.type';
import { DeleteApplicantAction } from './delete-applicant-action.type';
import { ExportDataAction } from './export-data-action.type';
import { FilterApplicantsAction } from './filter-applicants-action.type';
import { GenerateReportAction } from './generate-report-action.type';
import { MatchJobAction } from './match-job-action.type';
import { UpdateStatusAction } from './update-status-action.type';

export type ExecutableAction =
  | FilterApplicantsAction
  | UpdateStatusAction
  | ExportDataAction
  | CreateApplicantAction
  | DeleteApplicantAction
  | GenerateReportAction
  | MatchJobAction
  | BulkUpdateAction;
