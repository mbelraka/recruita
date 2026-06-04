import { ApplicationStatus } from '../../applicants/enums/application-status.enum';
import { createApplicant } from '../../applicants/utilities/applicant-domain.util';
import { Languages } from '../../../enums/language.enum';
import { CsvApplicantExporter } from './csv-applicant.exporter';
import { ExportTranslationHelper } from './export-translation.helper';

describe('CsvApplicantExporter', () => {
  it('generates csv using configured headers', () => {
    const translate = {
      instant: jasmine.createSpy('instant').and.callFake((key: string) => key),
    };
    const helper = new ExportTranslationHelper(translate as never);
    const exporter = new CsvApplicantExporter(helper);

    const csv = exporter.generate(
      [
        createApplicant({
          id: '1',
          name: 'Alex',
          email: 'a@example.com',
          phone: '123',
          location: 'Bern',
          yearsOfExperience: 2,
          applicationStatus: ApplicationStatus.Received,
          currentJobTitle: 'Engineer',
          skills: ['Angular'],
        }),
      ],
      Languages.English
    );

    expect(csv).toContain('name');
    expect(csv).toContain('Alex');
    expect(csv.split('\n').length).toBeGreaterThan(1);
  });
});
