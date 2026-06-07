import { ActionType } from '../enums/action-type.enum';
import { GenerateReportParams } from './generate-report-params.interface';

export type GenerateReportAction = {
  readonly type: ActionType.GenerateReport;
  readonly params: GenerateReportParams;
};
