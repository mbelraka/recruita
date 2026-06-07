import { ActionType } from '../enums/action-type.enum';
import { FilterParams } from './filter-params.interface';

export type FilterApplicantsAction = {
  readonly type: ActionType.FilterApplicants;
  readonly params: FilterParams;
};
