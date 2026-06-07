import { ActionType } from '../modules/smart-action/enums/action-type.enum';
import { ReportType } from '../modules/smart-action/enums/report-type.enum';
import { ExportFormats } from '../modules/export/enums/export-formats.enum';
import { createEnumGuard, joinEnumValues } from './enum.util';

describe('enum utilities', () => {
  const isActionType = createEnumGuard(ActionType);
  const isReportType = createEnumGuard(ReportType);
  const isExportFormat = createEnumGuard(ExportFormats);

  it('createEnumGuard accepts known wire values', () => {
    expect(isActionType(ActionType.FilterApplicants)).toBe(true);
    expect(isReportType(ReportType.PipelineSummary)).toBe(true);
    expect(isExportFormat(ExportFormats.PDF)).toBe(true);
  });

  it('createEnumGuard rejects unknown values', () => {
    expect(isActionType('NOT_AN_ACTION')).toBe(false);
    expect(isReportType(null)).toBe(false);
    expect(isExportFormat(undefined)).toBe(false);
  });

  it('joinEnumValues formats enum values with the requested separator', () => {
    expect(joinEnumValues(ActionType, ', ')).toContain(
      ActionType.FilterApplicants
    );
    expect(joinEnumValues(ReportType, '|')).toContain('pipeline_summary');
    expect(joinEnumValues(ExportFormats, '|')).toBe('csv|json|excel|pdf');
  });
});
