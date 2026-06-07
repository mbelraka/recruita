import { map, take } from 'rxjs';

import { patchApplicantFilters } from '../../../applicants/state/applicants.actions';
import { selectAllApplicants } from '../../../applicants/state/applicants.selectors';
import {
  buildApplicantListFiltersFromSmartAction,
  filterApplicantList,
} from '../../../applicants/utilities/applicant-filters.util';
import { FilterParams } from '../../models/filter-params.interface';
import { ActionResult } from '../../models/action-result.interface';
import { SmartActionExecutionDeps } from '../../models/smart-action-execution-deps.interface';
import { SMART_ACTION_MESSAGES } from '../../constants/smart-action-messages.constants';

export function executeFilterApplicants(
  params: FilterParams,
  deps: SmartActionExecutionDeps
) {
  return deps.store.select(selectAllApplicants).pipe(
    take(1),
    map((applicants) => {
      const filters = buildApplicantListFiltersFromSmartAction(
        params,
        applicants
      );
      deps.store.dispatch(
        patchApplicantFilters({
          partial: {
            globalFilter: filters.globalFilter,
            skill: filters.skill,
            status: filters.status,
            country: filters.country,
          },
        })
      );

      const filtered = filterApplicantList(applicants, filters);
      return {
        success: true,
        message: SMART_ACTION_MESSAGES.FILTER_RESULTS(filtered.length),
        data: { applicants: filtered, totalCount: filtered.length },
      } satisfies ActionResult;
    })
  );
}
