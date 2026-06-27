import type { MatchCandidateDto } from '../../../generated/api/types';

/** Fields allowed on the wire to the match API / LLM (plus an ephemeral correlation id). */
export type PrivacyPreservingCandidatePayload = Required<
  Pick<MatchCandidateDto, 'id' | 'currentJobTitle'>
> & {
  skills: string[];
  yearsOfExperience: number | null;
};
