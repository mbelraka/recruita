import { ActionType } from '../enums/action-type.enum';
import { CreateApplicantParams } from './create-applicant-params.interface';

export type CreateApplicantAction = {
  readonly type: ActionType.CreateApplicant;
  readonly params: CreateApplicantParams;
};
