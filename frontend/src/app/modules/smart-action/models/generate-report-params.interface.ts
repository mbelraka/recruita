import { FilterParams } from './filter-params.interface';
import { ReportType } from '../enums/report-type.enum';

export interface GenerateReportParams {
  readonly reportType: ReportType;
  readonly filters?: FilterParams;
}
