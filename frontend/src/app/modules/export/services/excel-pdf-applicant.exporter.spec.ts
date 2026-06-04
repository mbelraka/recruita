import { ApplicationStatus } from '../../applicants/enums/application-status.enum';
import { createApplicant } from '../../applicants/utilities/applicant-domain.util';
import { Languages } from '../../../enums/language.enum';
import { ExcelApplicantExporter } from './excel-applicant.exporter';
import { ExportTranslationHelper } from './export-translation.helper';
import { PdfApplicantExporter } from './pdf-applicant.exporter';

describe('ExcelApplicantExporter', () => {
  it('builds a workbook buffer', async () => {
    const translate = {
      instant: jasmine.createSpy('instant').and.callFake((key: string) => key),
    };
    const helper = new ExportTranslationHelper(translate as never);
    const exporter = new ExcelApplicantExporter(helper);

    const buffer = await exporter.generate(
      [
        createApplicant({
          id: '1',
          name: 'Alex',
          applicationStatus: ApplicationStatus.Received,
          skills: ['Go'],
        }),
      ],
      Languages.English
    );

    expect(buffer.byteLength).toBeGreaterThan(0);
  });
});

describe('PdfApplicantExporter', () => {
  it('builds pdf bytes', async () => {
    const translate = {
      instant: jasmine.createSpy('instant').and.callFake((key: string) => key),
    };
    const helper = new ExportTranslationHelper(translate as never);
    const exporter = new PdfApplicantExporter(helper);

    const bytes = await exporter.generate(
      [
        createApplicant({
          id: '1',
          name: 'Alex',
          notes: 'Ready',
          skills: ['Go'],
        }),
      ],
      Languages.English
    );

    expect(bytes.length).toBeGreaterThan(0);
  });
});
