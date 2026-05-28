import type { MatchApiResponse } from '../models/match-api-response.model';
import type { MatchScoreItem } from '../models/match-score-item.model';

export const MATCH_API_SCORE_COLLECTION_KEYS: ReadonlyArray<
  keyof MatchApiResponse
> = ['scores', 'results', 'candidates'];

export const MATCH_SCORE_CORRELATION_ID_KEYS: ReadonlyArray<
  keyof Pick<MatchScoreItem, 'id' | 'candidateId' | 'applicantId'>
> = ['id', 'candidateId', 'applicantId'];

export const MATCH_SCORE_NAME_KEYS: ReadonlyArray<
  keyof Pick<MatchScoreItem, 'name' | 'candidateName' | 'applicantName'>
> = ['name', 'candidateName', 'applicantName'];

/** First present field wins (same precedence as prior `??` chain). */
export const MATCH_SCORE_PRIMARY_VALUE_KEYS: ReadonlyArray<
  keyof Pick<
    MatchScoreItem,
    'matchScore' | 'score' | 'overallScore' | 'totalScore' | 'matchingScore'
  >
> = ['matchScore', 'score', 'overallScore', 'totalScore', 'matchingScore'];

/**
 * Keys tried on nested plain objects returned as “score” values by some APIs.
 */
export const MATCH_SCORE_NESTED_NUMERIC_KEYS = [
  'value',
  'score',
  'matchScore',
  'overallScore',
  'totalScore',
  'matchingScore',
  'percent',
  'percentage',
] as const;

export const MATCH_SCORE_RECOMMENDATION_TEXT_KEYS: ReadonlyArray<
  keyof Pick<MatchScoreItem, 'recommendation' | 'reasoning'>
> = ['recommendation', 'reasoning'];
