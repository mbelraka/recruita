import { UndoAction } from './undo-action.interface';

export interface ActionResult<T = unknown> {
  readonly success: boolean;
  readonly message: string;
  readonly data?: T;
  readonly undo?: UndoAction;
}
