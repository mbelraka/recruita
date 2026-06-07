import { from, map } from 'rxjs';

import { APP_CONFIG } from '../../../../config/app.config';
import {
  evaluateCandidates,
  setJobDescription,
} from '../../../match/state/match.actions';
import { SMART_ACTION_MESSAGES } from '../../constants/smart-action-messages.constants';
import { ActionResult } from '../../models/action-result.interface';
import { MatchJobParams } from '../../models/match-job-params.interface';
import { SmartActionExecutionDeps } from '../../models/smart-action-execution-deps.interface';

export function executeMatchJob(
  params: MatchJobParams,
  deps: SmartActionExecutionDeps
) {
  return from(deps.router.navigate([APP_CONFIG.ROUTES.MATCH])).pipe(
    map((): ActionResult => {
      deps.store.dispatch(
        setJobDescription({ jobDescription: params.jobDescription })
      );
      deps.store.dispatch(evaluateCandidates());
      return {
        success: true,
        message: SMART_ACTION_MESSAGES.MATCH_JOB,
        data: {
          limit:
            params.limit ??
            APP_CONFIG.SMART_ACTION.VALIDATION.MATCH_LIMIT_DEFAULT,
        },
      };
    })
  );
}
