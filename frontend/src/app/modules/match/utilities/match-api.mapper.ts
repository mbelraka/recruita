import type {
  MatchCandidateDto,
  MatchRequestDto,
} from '../../../generated/api/types';
import type { MatchApiResponse } from '../models/match-api-response.model';
import type { MatchProxyRequestBody } from '../models/match-proxy-request-body.model';
import type { MatchScoreItem } from '../models/match-score-item.model';
import type { MatchScoreListCarrier } from '../models/match-score-list-carrier.model';
import type { PrivacyPreservingCandidatePayload } from '../models/privacy-preserving-candidate-payload.model';

const MATCH_SCORE_LIST_KEYS = ['scores', 'results', 'candidates'] as const;

/** Maps anonymized client payloads to the generated OpenAPI request DTO. */
export function toMatchRequestDto(
  body: MatchProxyRequestBody
): MatchRequestDto {
  const {
    language: _language,
    locale: _locale,
    candidates,
    ...wireFields
  } = body;

  return {
    ...wireFields,
    candidates: candidates.map(toMatchCandidateDto),
  };
}

export function toMatchCandidateDto(
  candidate: PrivacyPreservingCandidatePayload
): MatchCandidateDto {
  return {
    id: candidate.id,
    skills: [...candidate.skills],
    yearsOfExperience: candidate.yearsOfExperience ?? undefined,
    currentJobTitle: candidate.currentJobTitle,
  };
}

/** Reads the first present score list from deterministic or Groq-shaped responses. */
export function readMatchScoreLists(
  response: MatchScoreListCarrier
): MatchScoreItem[] {
  for (const key of MATCH_SCORE_LIST_KEYS) {
    const list: readonly MatchScoreItem[] | undefined = response[key];
    if (list !== undefined) {
      return [...list];
    }
  }
  return [];
}

/** Narrows generated wire responses to the parser's loose score-list shape. */
export function asMatchScoreListCarrier(
  response: MatchApiResponse
): MatchScoreListCarrier {
  return response as MatchScoreListCarrier;
}
