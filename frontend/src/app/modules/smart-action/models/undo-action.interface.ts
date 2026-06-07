import { ActionType } from '../enums/action-type.enum';

export interface UndoAction {
  readonly type: ActionType;
  readonly params: Record<string, unknown>;
}
