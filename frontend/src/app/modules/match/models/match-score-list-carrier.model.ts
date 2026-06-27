import type { MatchScoreItem } from './match-score-item.model';

/** Loose Groq/deterministic payload shape before normalization. */
export type MatchScoreListCarrier = {
  readonly scores?: readonly MatchScoreItem[];
  readonly results?: readonly MatchScoreItem[];
  readonly candidates?: readonly MatchScoreItem[];
};
