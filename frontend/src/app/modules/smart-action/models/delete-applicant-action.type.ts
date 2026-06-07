import { ActionType } from '../enums/action-type.enum';
import { DeleteApplicantParams } from './delete-applicant-params.interface';

export type DeleteApplicantAction = {
  readonly type: ActionType.DeleteApplicant;
  readonly params: DeleteApplicantParams;
};
