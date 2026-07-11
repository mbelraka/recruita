import type {
  MatchCandidateDto,
  MatchRequestDto,
} from '../../../generated/api/types';
import type { MatchProxyRequestBody } from '../models/match-proxy-request-body.model';
import type { PrivacyPreservingCandidatePayload } from '../models/privacy-preserving-candidate-payload.model';

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
