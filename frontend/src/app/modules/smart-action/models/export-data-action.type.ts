import { ActionType } from '../enums/action-type.enum';
import { ExportParams } from './export-params.interface';

export interface ExportDataAction {
  readonly type: ActionType.ExportData;
  readonly params: ExportParams;
}
