import { Languages } from '../../../enums/language.enum';
import { Applicant } from '../../applicants/models/applicant.model';

export interface MatchEvaluationInputs {
  readonly jobDescription: string;
  readonly applicants: readonly Applicant[];
  readonly topCandidatesCount: number;
  readonly language: Languages;
}
