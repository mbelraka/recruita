/** `MatchScoreItem` fields replaced when parsing API match scores. */
export const MATCH_SCORE_ITEM_PARSED_OMITTED_FIELD = {
  ID: 'id',
  MATCH_SCORE: 'matchScore',
  SCORE: 'score',
} as const;

export type MatchScoreItemParsedOmittedField =
  (typeof MATCH_SCORE_ITEM_PARSED_OMITTED_FIELD)[keyof typeof MATCH_SCORE_ITEM_PARSED_OMITTED_FIELD];
