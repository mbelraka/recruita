import { createFeatureSelector, createSelector } from '@ngrx/store';

import { StateFeatures } from '../../../containers/root/enums/state-features.enum';
import { SmartActionFeatureState } from '../models/smart-action-state.model';

export const selectSmartActionState =
  createFeatureSelector<SmartActionFeatureState>(StateFeatures.SmartAction);

export const selectSmartActionProcessing = createSelector(
  selectSmartActionState,
  (state) => state.processing
);

export const selectSmartActionResult = createSelector(
  selectSmartActionState,
  (state) => state.result
);

export const selectSmartActionLastAction = createSelector(
  selectSmartActionState,
  (state) => state.lastAction
);

export const selectSmartActionCanUndo = createSelector(
  selectSmartActionResult,
  (result) => Boolean(result?.undo)
);
