import { createAction, props } from '@ngrx/store';

import { SmartActionActionNames } from '../enums/smart-action-actions.enum';
import { ActionResult } from '../models/action-result.interface';
import { ParsedAction } from '../models/parsed-action.type';

export const submitSmartActionCommand = createAction(
  SmartActionActionNames.SUBMIT_COMMAND,
  props<{ command: string }>()
);

export const parseSmartActionSuccess = createAction(
  SmartActionActionNames.PARSE_SUCCESS,
  props<{ action: ParsedAction }>()
);

export const parseSmartActionFailure = createAction(
  SmartActionActionNames.PARSE_FAILURE,
  props<{ errors: readonly string[] }>()
);

export const executeSmartAction = createAction(
  SmartActionActionNames.EXECUTE,
  props<{ action: ParsedAction }>()
);

export const executeSmartActionSuccess = createAction(
  SmartActionActionNames.EXECUTE_SUCCESS,
  props<{ action: ParsedAction; result: ActionResult; durationMs: number }>()
);

export const executeSmartActionFailure = createAction(
  SmartActionActionNames.EXECUTE_FAILURE,
  props<{ message: string }>()
);

export const undoSmartAction = createAction(SmartActionActionNames.UNDO);

export const clearSmartActionResult = createAction(
  SmartActionActionNames.CLEAR_RESULT
);
