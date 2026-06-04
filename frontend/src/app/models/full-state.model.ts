import { EntityCache } from '@ngrx/data';

import { ApplicantUiState } from '../modules/applicants/models/applicant-state.model';
import { MainState } from '../modules/main/models/main-state.model';
import { MatchFeatureState } from '../modules/match/models/match-state.model';
import { ExportFeatureState } from '../modules/export/models/export-state.model';
import { StateFeatures } from '../containers/root/enums/state-features.enum';
import { ENTITY_CACHE_STATE_KEY } from '../core/entity-data/entity-cache.selectors';
import { AppState } from './app-state.model';

export interface FullState {
  app: AppState;
  [ENTITY_CACHE_STATE_KEY]?: EntityCache;
  [StateFeatures.Main]?: MainState;
  [StateFeatures.Applicants]?: ApplicantUiState;
  [StateFeatures.Match]?: MatchFeatureState;
  [StateFeatures.Export]?: ExportFeatureState;
}
