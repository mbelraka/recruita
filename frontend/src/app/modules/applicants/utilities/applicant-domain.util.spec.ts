import {
  applicantHasSkill,
  createApplicant,
  isValidApplicant,
} from './applicant-domain.util';
import { ApplicationStatus } from '../enums/application-status.enum';

describe('applicant-domain.util', () => {
  it('should initialize empty if no init provided', () => {
    const applicant = createApplicant();
    expect(applicant.id).toBe('');
  });

  it('should populate from legacy names', () => {
    const applicant = createApplicant({
      firstName: 'John',
      lastName: 'Doe',
    } as Parameters<typeof createApplicant>[0]);
    expect(applicant.name).toBe('John Doe');
  });

  it('should not populate legacy name if name exists', () => {
    const applicant = createApplicant({
      firstName: 'John',
      lastName: 'Doe',
      name: 'Real Name',
    } as Parameters<typeof createApplicant>[0]);
    expect(applicant.name).toBe('Real Name');
  });

  it('should handle numeric experience', () => {
    const applicant = createApplicant({
      yearsOfExperience: '5',
    } as Parameters<typeof createApplicant>[0]);
    expect(applicant.yearsOfExperience).toBe(5);

    const applicantInvalidExp = createApplicant({
      yearsOfExperience: 'abc',
    } as Parameters<typeof createApplicant>[0]);
    expect(applicantInvalidExp.yearsOfExperience).toBeUndefined();
  });

  it('should handle availableFrom dates strings and numbers', () => {
    const applicantStr = createApplicant({
      availableFrom: '2024-01-01',
    } as Parameters<typeof createApplicant>[0]);
    expect(applicantStr.availableFrom).toBeInstanceOf(Date);

    const applicantNum = createApplicant({
      availableFrom: 1_704_067_200_000,
    } as Parameters<typeof createApplicant>[0]);
    expect(applicantNum.availableFrom).toBeInstanceOf(Date);

    const applicantInvalid = createApplicant({
      availableFrom: 'invalid',
    } as Parameters<typeof createApplicant>[0]);
    expect(applicantInvalid.availableFrom).toBeUndefined();
  });

  it('should evaluate isValidApplicant correctly', () => {
    const invalidEmpty = createApplicant();
    expect(isValidApplicant(invalidEmpty)).toBeFalse();

    const valid = createApplicant({
      id: '1',
      name: 'John',
      email: 'a@a.com',
      phone: '123',
      skills: ['A'],
    });
    expect(isValidApplicant(valid)).toBeTrue();

    const invalidNoSkills = createApplicant({
      id: '1',
      name: 'John',
      email: 'a@a.com',
      phone: '123',
      skills: [],
    });
    expect(isValidApplicant(invalidNoSkills)).toBeFalse();
  });

  it('should evaluate applicantHasSkill correctly', () => {
    const applicant = createApplicant({
      skills: ['Angular', 'React'],
    } as Parameters<typeof createApplicant>[0]);
    expect(applicantHasSkill(applicant, 'Angular')).toBeTrue();
    expect(applicantHasSkill(applicant, 'Vue')).toBeFalse();

    const noSkills = createApplicant();
    expect(applicantHasSkill(noSkills, 'Angular')).toBeFalse();
  });

  it('rejects unknown application status values', () => {
    const applicant = createApplicant({
      id: '2',
      applicationStatus: 'not-a-status',
    } as unknown as Parameters<typeof createApplicant>[0]);
    expect(applicant.applicationStatus).toBeUndefined();
  });

  it('preserves typed application status', () => {
    const applicant = createApplicant({
      id: '3',
      applicationStatus: ApplicationStatus.OfferExtended,
    });
    expect(applicant.applicationStatus).toBe(ApplicationStatus.OfferExtended);
  });
});
