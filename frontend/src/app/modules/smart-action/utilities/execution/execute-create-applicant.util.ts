import { of } from 'rxjs';

import { ApplicationStatus } from '../../../applicants/enums/application-status.enum';
import { addApplicant } from '../../../applicants/state/applicants.actions';
import { createApplicant } from '../../../applicants/utilities/applicant-domain.util';
import { ActionType } from '../../enums/action-type.enum';
import { ActionResult } from '../../models/action-result.interface';
import { CreateApplicantParams } from '../../models/create-applicant-params.interface';
import { SmartActionExecutionDeps } from '../../models/smart-action-execution-deps.interface';

export function executeCreateApplicant(
  params: CreateApplicantParams,
  deps: SmartActionExecutionDeps
) {
  const applicant = createApplicant({
    id: crypto.randomUUID(),
    name: params.name,
    email: params.email,
    phone: params.phone,
    skills: [...params.skills],
    yearsOfExperience: params.yearsOfExperience,
    currentJobTitle: params.currentJobTitle,
    applicationStatus: ApplicationStatus.Received,
  });
  deps.store.dispatch(addApplicant({ applicant }));
  return of<ActionResult>({
    success: true,
    message: `Created applicant ${params.name}.`,
    data: { applicant },
    undo: {
      type: ActionType.DeleteApplicant,
      params: { applicantIdentifier: applicant.id },
    },
  });
}
