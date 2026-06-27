import { ActionType } from '../enums/action-type.enum';
import { CreateApplicantParams } from './create-applicant-params.interface';

export interface CreateApplicantAction {
  readonly type: ActionType.CreateApplicant;
  readonly params: CreateApplicantParams;
}
