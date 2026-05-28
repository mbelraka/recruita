import { createFeatureSelector, createSelector } from '@ngrx/store';

import { StateFeatures } from '../../../containers/root/enums/state-features.enum';
import { MainState } from '../models/main-state.model';

export const selectMainState = createFeatureSelector<MainState>(
  StateFeatures.Main
);

export const selectMainProfileState = createSelector(
  selectMainState,
  (state) => state.profile
);

export const selectProfile = createSelector(
  selectMainProfileState,
  (state) => state.profile
);

export const selectProfileLoaded = createSelector(
  selectMainProfileState,
  (state) => state.loaded
);
