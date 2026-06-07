import { Observable, of } from 'rxjs';

import { ActionType } from '../../enums/action-type.enum';
import { ActionResult } from '../../models/action-result.interface';
import { ExecutableAction } from '../../models/executable-action.type';
import { ParsedAction } from '../../models/parsed-action.type';
import { SmartActionExecutionDeps } from '../../models/smart-action-execution-deps.interface';
import { executeBulkUpdate } from './execute-bulk-update.util';
import { executeCreateApplicant } from './execute-create-applicant.util';
import { executeDeleteApplicant } from './execute-delete-applicant.util';
import { executeExportData } from './execute-export-data.util';
import { executeFilterApplicants } from './execute-filter-applicants.util';
import { executeGenerateReport } from './execute-generate-report.util';
import { executeMatchJob } from './execute-match-job.util';
import { executeUpdateStatus } from './execute-update-status.util';

export function executeParsedAction(
  action: ParsedAction,
  deps: SmartActionExecutionDeps
): Observable<ActionResult> {
  if (action.type === ActionType.Clarify) {
    return of({
      success: false,
      message: action.params.questions.join(' '),
    });
  }

  return executeExecutableAction(action, deps);
}

function executeExecutableAction(
  action: ExecutableAction,
  deps: SmartActionExecutionDeps
): Observable<ActionResult> {
  switch (action.type) {
    case ActionType.FilterApplicants:
      return executeFilterApplicants(action.params, deps);
    case ActionType.UpdateStatus:
      return executeUpdateStatus(action.params, deps);
    case ActionType.ExportData:
      return executeExportData(action.params.format, deps);
    case ActionType.CreateApplicant:
      return executeCreateApplicant(action.params, deps);
    case ActionType.DeleteApplicant:
      return executeDeleteApplicant(action.params, deps);
    case ActionType.GenerateReport:
      return executeGenerateReport(action.params.reportType, deps);
    case ActionType.MatchJob:
      return executeMatchJob(action.params, deps);
    case ActionType.BulkUpdate:
      return executeBulkUpdate(action.params, deps);
    default: {
      const _exhaustive: never = action;
      return of({
        success: false,
        message: `Unknown action: ${String(_exhaustive)}`,
      });
    }
  }
}
