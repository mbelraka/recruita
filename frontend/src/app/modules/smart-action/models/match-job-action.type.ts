import { ActionType } from '../enums/action-type.enum';
import { MatchJobParams } from './match-job-params.interface';

export interface MatchJobAction {
  readonly type: ActionType.MatchJob;
  readonly params: MatchJobParams;
}
