import { ActionType } from '../enums/action-type.enum';
import { UpdateStatusParams } from './update-status-params.interface';

export interface UpdateStatusAction {
  readonly type: ActionType.UpdateStatus;
  readonly params: UpdateStatusParams;
}
