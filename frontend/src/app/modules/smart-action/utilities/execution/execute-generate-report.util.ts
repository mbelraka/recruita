import { map, take } from 'rxjs';

import { APP_CONFIG } from '../../../../config/app.config';
import { selectAllApplicants } from '../../../applicants/state/applicants.selectors';
import { SMART_ACTION_MESSAGES } from '../../constants/smart-action-messages.constants';
import { ReportType } from '../../enums/report-type.enum';
import { ActionResult } from '../../models/action-result.interface';
import { SmartActionExecutionDeps } from '../../models/smart-action-execution-deps.interface';

export function executeGenerateReport(
  reportType: ReportType,
  deps: SmartActionExecutionDeps
) {
  return deps.store.select(selectAllApplicants).pipe(
    take(1),
    map((applicants): ActionResult => {
      const byStatus = applicants.reduce<Record<string, number>>((acc, a) => {
        const key =
          a.applicationStatus ??
          APP_CONFIG.SMART_ACTION.REPORT.UNKNOWN_STATUS_KEY;
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      return {
        success: true,
        message: SMART_ACTION_MESSAGES.GENERATE_REPORT(
          reportType.replaceAll(
            APP_CONFIG.SMART_ACTION.REPORT.TYPE_LABEL_REPLACE_FROM,
            APP_CONFIG.SMART_ACTION.REPORT.TYPE_LABEL_REPLACE_TO
          )
        ),
        data: {
          report: {
            type: reportType,
            total: applicants.length,
            byStatus,
          },
        },
      };
    })
  );
}
