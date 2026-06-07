import { ApplicationStatus } from '../../applicants/enums/application-status.enum';

/** Parsed FILTER_APPLICANTS params from the backend LLM — trusted as-is by the executor. */
export interface FilterParams {
  readonly skills?: readonly string[];
  readonly minExperience?: number;
  readonly maxExperience?: number;
  readonly status?: ApplicationStatus;
  /** Roster country label from the LLM (preferred). */
  readonly country?: string;
  /** Legacy alias accepted from older LLM responses. */
  readonly location?: string;
  readonly searchTerm?: string;
}
