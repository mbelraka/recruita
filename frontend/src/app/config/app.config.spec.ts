import { APP_CONFIG } from './app.config';
import { Languages } from '../enums/language.enum';

describe('AppConfig', () => {
  it('should fallback to default locale if language unsupported', () => {
    expect(APP_CONFIG.getLocale('unsupported_lang' as any)).toBe('en-US');
  });

  it('should fallback to default date format if language unsupported', () => {
    expect(APP_CONFIG.getDateFormat('unsupported_lang' as any)).toBe(
      'MM/dd/yyyy'
    );
  });

  it('should get correct locale for French', () => {
    expect(APP_CONFIG.getLocale(Languages.French)).toBe('fr-FR');
  });

  it('should get correct date format for French', () => {
    expect(APP_CONFIG.getDateFormat(Languages.French)).toBe('dd/MM/yyyy');
  });

  it('should get correct locale for Italian', () => {
    expect(APP_CONFIG.getLocale(Languages.Italian)).toBe('it-IT');
  });

  it('should get correct date format for Italian', () => {
    expect(APP_CONFIG.getDateFormat(Languages.Italian)).toBe('dd/MM/yyyy');
  });

  it('should get locale fallback for Romansh', () => {
    expect(APP_CONFIG.getLocale(Languages.Romansh)).toBe('de-CH');
  });

  it('should get correct date format for Romansh', () => {
    expect(APP_CONFIG.getDateFormat(Languages.Romansh)).toBe('dd.MM.yyyy');
  });

  it('should get correct locale for Spanish', () => {
    expect(APP_CONFIG.getLocale(Languages.Spanish)).toBe('es-ES');
  });

  it('should get correct date format for Spanish', () => {
    expect(APP_CONFIG.getDateFormat(Languages.Spanish)).toBe('dd/MM/yyyy');
  });

  it('should return full applicant list columns on large viewports', () => {
    expect(APP_CONFIG.getApplicantListDisplayedColumns('lg')).toEqual([
      'name',
      'currentJobTitle',
      'yearsOfExperience',
      'applicationStatus',
      'email',
      'phone',
      'availability',
      'location',
      'skills',
    ]);
  });

  it('should return reduced applicant list columns on narrow viewports', () => {
    expect(APP_CONFIG.getApplicantListDisplayedColumns('xs')).toEqual([
      'name',
      'applicationStatus',
      'currentJobTitle',
    ]);
    expect(APP_CONFIG.getApplicantListDisplayedColumns('md')).toContain(
      'location'
    );
    expect(APP_CONFIG.getApplicantListDisplayedColumns('md')).not.toContain(
      'skills'
    );
  });
});
