import { from, map, switchMap, take } from 'rxjs';

import { APP_CONFIG } from '../../../../config/app.config';
import {
  setFilterBySkill,
  setFilterByStatus,
  setGlobalFilter,
} from '../../../applicants/state/applicants.actions';
import { selectAllApplicants } from '../../../applicants/state/applicants.selectors';
import { FilterParams } from '../../models/filter-params.interface';
import { ActionResult } from '../../models/action-result.interface';
import { SmartActionExecutionDeps } from '../../models/smart-action-execution-deps.interface';
import { SMART_ACTION_MESSAGES } from '../../constants/smart-action-messages.constants';
import { applyLocalApplicantFilters } from './apply-local-applicant-filters.util';

export function executeFilterApplicants(
  params: FilterParams,
  deps: SmartActionExecutionDeps
) {
  if (params.searchTerm) {
    deps.store.dispatch(setGlobalFilter({ filter: params.searchTerm }));
  }
  if (params.status) {
    deps.store.dispatch(setFilterByStatus({ status: params.status }));
  }
  if (params.skills?.length) {
    deps.store.dispatch(setFilterBySkill({ skill: params.skills[0] ?? null }));
  }

  return from(deps.router.navigate([APP_CONFIG.ROUTES.APPLICANTS])).pipe(
    switchMap(() => deps.store.select(selectAllApplicants).pipe(take(1))),
    map((applicants) => {
      const filtered = applyLocalApplicantFilters(applicants, params);
      const result: ActionResult = {
        success: true,
        message: SMART_ACTION_MESSAGES.FILTER_RESULTS(filtered.length),
        data: { applicants: filtered, totalCount: filtered.length },
      };
      return result;
    })
  );
}
