import { ActionType } from '../enums/action-type.enum';
import { FilterParams } from './filter-params.interface';

export interface FilterApplicantsAction {
  readonly type: ActionType.FilterApplicants;
  readonly params: FilterParams;
}
