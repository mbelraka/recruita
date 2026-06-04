import { ApplicationStatus } from '../../applicants/enums/application-status.enum';
import { Languages } from '../../../enums/language.enum';
import { ExportTranslationHelper } from './export-translation.helper';
import { localizedExportFileName, wrapPdfText } from './export-file.util';
import { ExportFormats } from '../enums/export-formats.enum';

describe('ExportTranslationHelper', () => {
  let helper: ExportTranslationHelper;
  let translate: { instant: jasmine.Spy };

  beforeEach(() => {
    translate = {
      instant: jasmine.createSpy('instant').and.callFake((key: string) => key),
    };
    helper = new ExportTranslationHelper(translate as never);
  });

  it('returns fallback when translator echoes the key', () => {
    translate.instant.and.returnValue('applicantList.name');

    expect(helper.translateText('applicantList.name', 'Name')).toBe('Name');
  });

  it('translates application status enum values', () => {
    translate.instant.and.callFake((key: string) =>
      key === 'applicationStatus.offer_extended' ? 'Offer Extended' : key
    );

    expect(
      helper.translateApplicationStatus(ApplicationStatus.OfferExtended)
    ).toBe('Offer Extended');
  });

  it('returns null for missing application status', () => {
    expect(helper.translateApplicationStatus(undefined)).toBeNull();
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

    expect(helper.formatExperienceYears(1)).toBe('1 Year');
    expect(helper.formatExperienceYears(5)).toBe('5 Years');
    expect(helper.formatExperienceYears(undefined)).toBe('');
  });

  it('builds localized download file names from export.fileName', () => {
    translate.instant.and.callFake((key: string) =>
      key === 'export.fileName' ? 'Bewerber Export' : key
    );

    expect(localizedExportFileName(ExportFormats.CSV, helper)).toBe(
      'Bewerber-Export.csv'
    );
  });

  it('wraps text into multiple lines and handles blank input', () => {
    expect(wrapPdfText('one two three four', 7).length).toBeGreaterThan(1);
    expect(wrapPdfText('   ', 7)).toEqual(['']);
  });

  it('formats display and CSV dates with defaults for empty values', () => {
    const date = new Date('2026-02-10T00:00:00.000Z');

    expect(
      helper.formatDateForDisplay(date, Languages.English).length
    ).toBeGreaterThan(0);
    expect(helper.formatDateForDisplay(null, Languages.English)).toBe('-');
    expect(helper.formatDateForCsv(undefined, Languages.English)).toBe('');
  });
});
