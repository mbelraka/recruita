import { ExportFormats } from '../../export/enums/export-formats.enum';
import { FilterParams } from './filter-params.interface';

export interface ExportParams {
  readonly format: ExportFormats;
  readonly filters?: FilterParams;
}
