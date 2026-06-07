import { ActionType } from '../enums/action-type.enum';
import { BulkUpdateParams } from './bulk-update-params.interface';

export type BulkUpdateAction = {
  readonly type: ActionType.BulkUpdate;
  readonly params: BulkUpdateParams;
};
