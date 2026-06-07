import { from, map } from 'rxjs';

import { APP_CONFIG } from '../../../../config/app.config';
import { exportApplicants } from '../../../export/state/export.actions';
import { SMART_ACTION_MESSAGES } from '../../constants/smart-action-messages.constants';
import { ExportFormats } from '../../../export/enums/export-formats.enum';
import { ActionResult } from '../../models/action-result.interface';
import { SmartActionExecutionDeps } from '../../models/smart-action-execution-deps.interface';

export function executeExportData(
  format: ExportFormats,
  deps: SmartActionExecutionDeps
) {
  deps.store.dispatch(exportApplicants({ format }));
  return from(deps.router.navigate([APP_CONFIG.ROUTES.EXPORT])).pipe(
    map(
      (): ActionResult => ({
        success: true,
        message: SMART_ACTION_MESSAGES.EXPORT_DATA(format.toUpperCase()),
      })
    )
  );
}
