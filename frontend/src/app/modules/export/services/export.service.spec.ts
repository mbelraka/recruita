import { of } from 'rxjs';
import * as FileSaver from 'file-saver';

import { Languages } from '../../../enums/language.enum';
import { Applicant } from '../../applicants/models/applicant.model';
import { ExportService } from './export.service';

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
    service = new ExportService(store as never, translate as never);
  });

  it('exports CSV via saveAs with configured filename', async () => {
    const saveAsSpy = spyOn(FileSaver, 'saveAs');
    const applicants: Applicant[] = [
      new Applicant({
        id: '1',
        name: 'Jane "JJ", Doe',
        email: 'jane@example.com',
        phone: '123',
        location: 'Bern',
        yearsOfExperience: 1,
        applicationStatus: 'In Review',
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
        'applicationStatus.in_review': 'In Review',
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
      new Applicant({
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

  it('builds localized download file names from export.fileName', () => {
    translate.instant.and.callFake((key: string) =>
      key === 'export.fileName' ? 'Bewerber Export' : key
    );

    const fileName = (service as any)._localizedFileName('csv');

    expect(fileName).toBe('Bewerber-Export.csv');
  });

  it('falls back to configured stem when translation is empty', () => {
    const fileName = (service as any)._localizedFileName('json');

    expect(fileName).toBe('applicants.json');
  });

  it('returns fallback when translation key is empty', () => {
    const result = (service as any)._translateText('', 'Fallback');

    expect(result).toBe('Fallback');
  });

  it('returns fallback when translator echoes the key', () => {
    translate.instant.and.returnValue('applicantList.name');

    const result = (service as any)._translateText(
      'applicantList.name',
      'Name'
    );

    expect(result).toBe('Name');
  });

  it('translates application status when value exists', () => {
    translate.instant.and.callFake((key: string) =>
      key === 'applicationStatus.in_review' ? 'In Review' : key
    );

    const result = (service as any)._translateApplicationStatus('In Review');

    expect(result).toBe('In Review');
  });

  it('returns null for empty application status', () => {
    const result = (service as any)._translateApplicationStatus('   ');

    expect(result).toBeNull();
  });

  it('formats experience years with singular and plural labels', () => {
    translate.instant.and.callFake((key: string) => {
      if (key === 'experienceDisplay.unitYear') {
        return 'Year';
      }
      if (key === 'experienceDisplay.unitYears') {
        return 'Years';
      }
      return key;
    });

    const singular = (service as any)._formatExperienceYears(1);
    const plural = (service as any)._formatExperienceYears(5);

    expect(singular).toBe('1 Year');
    expect(plural).toBe('5 Years');
  });

  it('returns empty default for missing experience', () => {
    const result = (service as any)._formatExperienceYears(undefined);

    expect(result).toBe('');
  });

  it('normalizes repeated whitespace and trims notes text', () => {
    const result = (service as any)._normalizeText('  many   spaces \n here  ');

    expect(result).toBe('many spaces here');
  });

  it('formats display and CSV dates with defaults for empty values', () => {
    const date = new Date('2026-02-10T00:00:00.000Z');
    const display = (service as any)._formatDateForDisplay(
      date,
      Languages.English
    );
    const csv = (service as any)._formatDateForCSV(date, Languages.English);
    const emptyDisplay = (service as any)._formatDateForDisplay(
      null,
      Languages.English
    );
    const emptyCsv = (service as any)._formatDateForCSV(
      undefined,
      Languages.English
    );

    expect(display.length).toBeGreaterThan(0);
    expect(csv.length).toBeGreaterThan(0);
    expect(emptyDisplay).toBe('-');
    expect(emptyCsv).toBe('');
  });

  it('formats skills with delimiter and fallback for empty arrays', () => {
    const withSkills = (service as any)._formatSkills(
      ['Angular', 'TypeScript'],
      '; '
    );
    const emptySkills = (service as any)._formatSkills([], ', ', '-');

    expect(withSkills).toBe('Angular; TypeScript');
    expect(emptySkills).toBe('-');
  });

  it('maps applicant values into excel row defaults and translations', () => {
    translate.instant.and.callFake((key: string) =>
      key === 'applicationStatus.offer_extended' ? 'Offer Extended' : key
    );
    const row = (service as any)._toExcelRow(
      new Applicant({
        id: '2',
        name: 'Alice',
        applicationStatus: 'Offer Extended',
        skills: ['NgRx'],
      }),
      Languages.English,
      0
    );

    expect(row.index).toBe('1');
    expect(row.name).toBe('Alice');
    expect(row.id).toBeUndefined();
    expect(row.applicationStatus).toBe('Offer Extended');
    expect(row.availableFrom).toBe('-');
    expect(row.skills).toBe('NgRx');
  });

  it('builds translated excel columns from configured column metadata', () => {
    translate.instant.and.callFake((key: string) => {
      const map: Record<string, string> = {
        'applicantList.name': 'Nombre',
        'applicantList.location': 'Ubicacion',
      };
      return map[key] ?? key;
    });

    const columns = (service as any)._getExcelColumns();
    const nameColumn = columns.find(
      (column: { key: string }) => column.key === 'name'
    );
    const locationColumn = columns.find(
      (column: { key: string }) => column.key === 'location'
    );

    expect(columns.length).toBeGreaterThan(5);
    expect(nameColumn?.header).toBe('Nombre');
    expect(locationColumn?.header).toBe('Ubicacion');
  });

  it('builds PDF row text for notes and missing years branches', () => {
    translate.instant.and.callFake((key: string) => {
      const map: Record<string, string> = {
        'applicants.availableFrom': 'Available From',
        'applicantList.skills': 'Skills',
      };
      return map[key] ?? key;
    });

    const withNotes = (service as any)._buildPdfRowText(
      new Applicant({
        id: '3',
        name: 'Bob',
        notes: '  ready soon ',
        skills: ['Angular'],
        availableFrom: new Date('2026-03-01'),
      }),
      0,
      Languages.English
    );
    const noYears = (service as any)._buildPdfRowText(
      new Applicant({
        id: '4',
        name: 'Eve',
        notes: '   ',
      }),
      1,
      Languages.English
    );

    expect(withNotes).toContain('Notes: ready soon');
    expect(withNotes).toContain('Skills: Angular');
    expect(noYears).toContain(', -,');
  });

  it('returns empty string for CSV when applicants list is empty', () => {
    const csv = (service as any)._generateCSV([], Languages.English);

    expect(csv).toBe('');
  });

  it('wraps text into multiple lines and handles blank input', () => {
    const wrapped = (service as any)._wrapText('one two three four', 7);
    const blank = (service as any)._wrapText('   ', 7);

    expect(wrapped.length).toBeGreaterThan(1);
    expect(blank).toEqual(['']);
  });

  it('estimates minimum max line chars as 24', () => {
    const estimated = (service as any)._estimateMaxLineChars(30, 20);

    expect(estimated).toBe(24);
  });
});
