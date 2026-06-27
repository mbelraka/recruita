import type { MatchRequestDto } from '../../../generated/api/types';
import type { Languages } from '../../../enums/language.enum';
import type { PrivacyPreservingCandidatePayload } from './privacy-preserving-candidate-payload.model';

/** POST body for `/api/match` before stripping client-only hints for the wire. */
export type MatchProxyRequestBody = Omit<MatchRequestDto, 'candidates'> & {
  readonly candidates: readonly PrivacyPreservingCandidatePayload[];
  /** Client hint; Spring ignores this today. */
  readonly language?: Languages;
  readonly locale?: string;
};
