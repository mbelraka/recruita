import { createReducer, on } from '@ngrx/store';

import { APP_CONFIG } from '../../../config/app.config';
import { MatchFeatureState } from '../models/match-state.model';
import {
  evaluateCandidates,
  evaluateCandidatesFailure,
  evaluateCandidatesSuccess,
  invalidateMatchResults,
  resetMatchState,
  setJobDescription,
} from './match.actions';

const initialMatchState: MatchFeatureState = {
  loading: false,
  error: null,
  jobDescription: '',
  topCandidatesCount: APP_CONFIG.MATCH.TOP_CANDIDATES_COUNT,
  results: [],
};

export const matchReducer = createReducer(
  initialMatchState,
  on(resetMatchState, (): MatchFeatureState => ({ ...initialMatchState })),
  on(
    invalidateMatchResults,
    (state): MatchFeatureState => ({
      ...state,
      loading: false,
      error: null,
      results: [],
    })
  ),
  on(
    setJobDescription,
    (state, { jobDescription }): MatchFeatureState => ({
      ...state,
      jobDescription,
    })
  ),
  on(
    evaluateCandidates,
    (state): MatchFeatureState => ({
      ...state,
      loading: true,
      error: null,
      results: [],
    })
  ),
  on(
    evaluateCandidatesSuccess,
    (state, { results }): MatchFeatureState => ({
      ...state,
      loading: false,
      error: null,
      results,
    })
  ),
  on(
    evaluateCandidatesFailure,
    (state, { error }): MatchFeatureState => ({
      ...state,
      loading: false,
      error,
      results: [],
    })
  )
);
