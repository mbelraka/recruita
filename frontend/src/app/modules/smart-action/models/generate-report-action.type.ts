import { ActionType } from '../enums/action-type.enum';
import { GenerateReportParams } from './generate-report-params.interface';

export interface GenerateReportAction {
  readonly type: ActionType.GenerateReport;
  readonly params: GenerateReportParams;
}
