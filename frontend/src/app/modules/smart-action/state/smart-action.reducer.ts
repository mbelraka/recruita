import { createReducer, on } from '@ngrx/store';

import { SMART_ACTION_MESSAGES } from '../constants/smart-action-messages.constants';
import { SmartActionFeatureState } from '../models/smart-action-state.model';
import {
  clearSmartActionResult,
  executeSmartAction,
  executeSmartActionFailure,
  executeSmartActionSuccess,
  parseSmartActionFailure,
  parseSmartActionSuccess,
  submitSmartActionCommand,
  undoSmartAction,
} from './smart-action.actions';

export const initialSmartActionState: SmartActionFeatureState = {
  processing: false,
  parseErrors: null,
  lastAction: null,
  result: null,
};

export const smartActionReducer = createReducer(
  initialSmartActionState,
  on(
    submitSmartActionCommand,
    (): SmartActionFeatureState => ({
      ...initialSmartActionState,
      processing: true,
    })
  ),
  on(
    parseSmartActionSuccess,
    (state, { action }): SmartActionFeatureState => ({
      ...state,
      parseErrors: null,
      lastAction: action,
    })
  ),
  on(
    parseSmartActionFailure,
    (state, { errors }): SmartActionFeatureState => ({
      ...state,
      processing: false,
      parseErrors: errors,
      result: {
        success: false,
        message: `${SMART_ACTION_MESSAGES.PARSE_FAILURE_PREFIX} ${errors.join(', ')}`,
      },
    })
  ),
  on(
    executeSmartAction,
    (state): SmartActionFeatureState => ({
      ...state,
      processing: true,
    })
  ),
  on(
    executeSmartActionSuccess,
    (state, { result }): SmartActionFeatureState => ({
      ...state,
      processing: false,
      result,
    })
  ),
  on(
    executeSmartActionFailure,
    (state, { message }): SmartActionFeatureState => ({
      ...state,
      processing: false,
      result: { success: false, message },
    })
  ),
  on(
    undoSmartAction,
    (state): SmartActionFeatureState => ({
      ...state,
      processing: true,
    })
  ),
  on(
    clearSmartActionResult,
    (state): SmartActionFeatureState => ({
      ...state,
      result: null,
      parseErrors: null,
    })
  )
);
