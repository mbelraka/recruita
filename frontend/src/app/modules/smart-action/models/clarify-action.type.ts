import { ActionType } from '../enums/action-type.enum';
import { ClarifyParams } from './clarify-params.interface';

export type ClarifyAction = {
  readonly type: ActionType.Clarify;
  readonly params: ClarifyParams;
};
