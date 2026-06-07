import { of, switchMap } from 'rxjs';

import { deleteApplicant } from '../../../applicants/state/applicants.actions';
import {
  SMART_ACTION_FALLBACKS,
  SMART_ACTION_MESSAGES,
} from '../../constants/smart-action-messages.constants';
import { ActionResult } from '../../models/action-result.interface';
import { SmartActionExecutionDeps } from '../../models/smart-action-execution-deps.interface';
import { findApplicantByIdentifier } from './find-applicant-by-identifier.util';

export function executeDeleteApplicant(
  params: { applicantIdentifier: string },
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
      deps.store.dispatch(deleteApplicant({ id: applicant.id }));
      return of<ActionResult>({
        success: true,
        message: SMART_ACTION_MESSAGES.DELETED_APPLICANT(
          applicant.name ??
            applicant.email ??
            SMART_ACTION_FALLBACKS.UNKNOWN_APPLICANT_LABEL
        ),
        data: { deletedApplicant: applicant },
      });
    })
  );
}
