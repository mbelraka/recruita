import { map, take } from 'rxjs';

import { Applicant } from '../../../applicants/models/applicant.model';
import { updateApplicant } from '../../../applicants/state/applicants.actions';
import { selectAllApplicants } from '../../../applicants/state/applicants.selectors';
import { ActionResult } from '../../models/action-result.interface';
import { BulkUpdateParams } from '../../models/bulk-update-params.interface';
import { SmartActionExecutionDeps } from '../../models/smart-action-execution-deps.interface';
import { applyLocalApplicantFilters } from './apply-local-applicant-filters.util';

export function executeBulkUpdate(
  params: BulkUpdateParams,
  deps: SmartActionExecutionDeps
) {
  return deps.store.select(selectAllApplicants).pipe(
    take(1),
    map((applicants): ActionResult => {
      const targets = applyLocalApplicantFilters(applicants, params.filters);
      for (const applicant of targets) {
        const updated: Applicant = {
          ...applicant,
          ...(params.updates.applicationStatus
            ? {
                applicationStatus: params.updates.applicationStatus,
              }
            : {}),
          ...(params.updates.notes ? { notes: params.updates.notes } : {}),
        };
        deps.store.dispatch(updateApplicant({ applicant: updated }));
      }
      return {
        success: true,
        message: `Updated ${targets.length} applicants.`,
        data: { updatedCount: targets.length },
      };
    })
  );
}
