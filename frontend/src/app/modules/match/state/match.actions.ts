import { createAction, props } from '@ngrx/store';

import { MatchCandidateResult } from '../models/match-candidate-result.model';

export const setJobDescription = createAction(
  '[Match] Set Job Description',
  props<{ jobDescription: string }>()
);

export const resetMatchState = createAction('[Match] Reset State');

/** Clears evaluation results when applicant data changes; keeps the job description. */
export const invalidateMatchResults = createAction(
  '[Match] Invalidate Results'
);

export const evaluateCandidates = createAction('[Match] Evaluate Candidates');

export const evaluateCandidatesSuccess = createAction(
  '[Match] Evaluate Candidates Success',
  props<{ results: MatchCandidateResult[] }>()
);

export const evaluateCandidatesFailure = createAction(
  '[Match] Evaluate Candidates Failure',
  props<{ error: string }>()
);
