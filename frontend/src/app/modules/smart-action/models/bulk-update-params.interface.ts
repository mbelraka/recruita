import { ApplicationStatus } from '../../applicants/enums/application-status.enum';
import { FilterParams } from './filter-params.interface';

export interface BulkUpdateParams {
  readonly filters: FilterParams;
  readonly updates: {
    readonly applicationStatus?: ApplicationStatus;
    readonly notes?: string;
  };
}
