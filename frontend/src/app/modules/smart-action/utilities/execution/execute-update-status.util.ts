import { of, switchMap } from 'rxjs';

import { ApplicationStatus } from '../../../applicants/enums/application-status.enum';
import { Applicant } from '../../../applicants/models/applicant.model';
import { updateApplicant } from '../../../applicants/state/applicants.actions';
import {
  SMART_ACTION_FALLBACKS,
  SMART_ACTION_MESSAGES,
} from '../../constants/smart-action-messages.constants';
import { ActionType } from '../../enums/action-type.enum';
import { ActionResult } from '../../models/action-result.interface';
import { SmartActionExecutionDeps } from '../../models/smart-action-execution-deps.interface';
import { findApplicantByIdentifier } from './find-applicant-by-identifier.util';

export function executeUpdateStatus(
  params: { applicantIdentifier: string; newStatus: ApplicationStatus },
  deps: SmartActionExecutionDeps
) {
  return findApplicantByIdentifier(deps.store, params.applicantIdentifier).pipe(
    switchMap((applicant) => {
      if (!applicant) {
        return of<ActionResult>({
          success: false,
          message: SMART_ACTION_MESSAGES.APPLICANT_NOT_FOUND(
            params.applicantIdentifier
          ),
        });
      }
      const previousStatus = applicant.applicationStatus;
      const updated: Applicant = {
        ...applicant,
        applicationStatus: params.newStatus,
      };
      deps.store.dispatch(updateApplicant({ applicant: updated }));
      return of<ActionResult>({
        success: true,
        message: SMART_ACTION_MESSAGES.MOVED_APPLICANT_STATUS(
          applicant.name ??
            applicant.email ??
            SMART_ACTION_FALLBACKS.UNKNOWN_APPLICANT_LABEL,
          params.newStatus
        ),
        data: { applicant: updated },
        undo: previousStatus
          ? {
              type: ActionType.UpdateStatus,
              params: {
                applicantIdentifier: applicant.id,
                newStatus: previousStatus,
              },
            }
          : undefined,
      });
    })
  );
}
