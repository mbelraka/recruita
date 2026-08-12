import { createAction, props } from '@ngrx/store';

import { MatchActionTypes } from '../enums/match-action-types.enum';
import { MatchCandidateResult } from '../models/match-candidate-result.model';

export const setJobDescription = createAction(
  MatchActionTypes.SetJobDescription,
  props<{ jobDescription: string }>()
);

export const resetMatchState = createAction(MatchActionTypes.ResetState);

/** Clears evaluation results when applicant data changes; keeps the job description. */
export const invalidateMatchResults = createAction(
  MatchActionTypes.InvalidateResults
);

export const evaluateCandidates = createAction(
  MatchActionTypes.EvaluateCandidates
);

export const evaluateCandidatesSuccess = createAction(
  MatchActionTypes.EvaluateCandidatesSuccess,
  props<{ results: MatchCandidateResult[] }>()
);

export const evaluateCandidatesFailure = createAction(
  MatchActionTypes.EvaluateCandidatesFailure,
  props<{ error: string }>()
);
