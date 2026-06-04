import { of } from 'rxjs';
import * as FileSaver from 'file-saver';

import { ApplicationStatus } from '../../applicants/enums/application-status.enum';
import { createApplicant } from '../../applicants/utilities/applicant-domain.util';
import { Languages } from '../../../enums/language.enum';
import { Applicant } from '../../applicants/models/applicant.model';
import { CsvApplicantExporter } from './csv-applicant.exporter';
import { ExcelApplicantExporter } from './excel-applicant.exporter';
import { ExportService } from './export.service';
import { ExportTranslationHelper } from './export-translation.helper';
import { JsonApplicantExporter } from './json-applicant.exporter';
import { PdfApplicantExporter } from './pdf-applicant.exporter';

describe('ExportService', () => {
  let service: ExportService;
  let store: { select: jasmine.Spy };
  let translate: { instant: jasmine.Spy };

  beforeEach(() => {
    store = {
      select: jasmine.createSpy('select'),
    };
    translate = {
      instant: jasmine.createSpy('instant').and.callFake((key: string) => key),
    };
    const translation = new ExportTranslationHelper(translate as never);
    service = new ExportService(
      store as never,
      new CsvApplicantExporter(translation),
      new JsonApplicantExporter(),
      new ExcelApplicantExporter(translation),
      new PdfApplicantExporter(translation),
      translation
    );
  });

  it('exports CSV via saveAs with configured filename', async () => {
    const saveAsSpy = spyOn(FileSaver, 'saveAs');
    const applicants: Applicant[] = [
      createApplicant({
        id: '1',
        name: 'Jane "JJ", Doe',
        email: 'jane@example.com',
        phone: '123',
        location: 'Bern',
        yearsOfExperience: 1,
        applicationStatus: ApplicationStatus.Screening,
        currentJobTitle: 'Frontend Engineer',
        availableFrom: new Date('2026-01-01'),
        skills: ['Angular', 'NgRx'],
        notes: '  high   potential  ',
      }),
    ];

    store.select.and.returnValues(of(applicants), of(Languages.English));
    translate.instant.and.callFake((key: string) => {
      const labels: Record<string, string> = {
        'export.fileName': 'applicants',
        'experienceDisplay.unitYear': 'Year',
        'applicationStatus.screening': 'Screening',
      };
      return labels[key] ?? key;
    });

    await service.exportAsCSV();

    expect(saveAsSpy).toHaveBeenCalled();
    expect(saveAsSpy.calls.mostRecent().args[1]).toBe('applicants.csv');
  });

  it('exports JSON with indentation and exportIndex', async () => {
    const saveAsSpy = spyOn(FileSaver, 'saveAs');
    const applicants: Applicant[] = [
      createApplicant({
        id: 'a-1',
        name: 'John',
      }),
    ];
    store.select.and.returnValues(of(applicants), of(Languages.English));

    await service.exportAsJSON();

    const blobArg = saveAsSpy.calls.mostRecent().args[0] as Blob;
    expect(saveAsSpy.calls.mostRecent().args[1]).toBe('applicants.json');
    expect(blobArg.type).toBe('application/json');
    const payload = await blobArg.text();
    expect(payload).toContain('"exportIndex": 1');
    expect(payload).not.toContain('"id"');
    expect(payload).toContain('\n  {');
  });
});
