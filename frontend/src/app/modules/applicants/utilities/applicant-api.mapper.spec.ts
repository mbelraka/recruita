import { createApplicant } from './applicant-domain.util';
import {
  applicantFromApi,
  applicantToApiWrite,
  applicantsFromApi,
  applicantsFromApiSummary,
} from './applicant-api.mapper';

describe('applicant-api.mapper', () => {
  it('maps API records into Applicant models', () => {
    const applicant = applicantFromApi({
      id: 'a-1',
      name: 'Alex',
      availableFrom: '2026-06-01',
      skills: ['Angular'],
    });

    expect(applicant.id).toBe('a-1');
    expect(applicant.name).toBe('Alex');
    expect(applicant.availableFrom).toEqual(new Date('2026-06-01'));
    expect(applicant.skills).toEqual(['Angular']);
  });

  it('defaults missing API skills to an empty list', () => {
    const applicant = applicantFromApi({ id: 'a-1' });
    expect(applicant.skills).toEqual([]);
  });

  it('maps applicant models into API write payloads', () => {
    const payload = applicantToApiWrite(
      createApplicant({
        id: 'a-2',
        name: 'Sam',
        skills: ['Java'],
        availableFrom: new Date('2026-07-15T15:00:00.000Z'),
      })
    );

    expect(payload.id).toBe('a-2');
    expect(payload.availableFrom).toBe('2026-07-15');
    expect(payload.skills).toEqual(['Java']);
  });

  it('maps arrays of API summary records without notes', () => {
    const applicants = applicantsFromApiSummary([
      { id: 'a-1', skills: [] },
      { id: 'a-2', skills: ['Go'] },
    ]);

    expect(applicants.map((a) => a.id)).toEqual(['a-1', 'a-2']);
    expect(applicants[0].notes).toBeUndefined();
  });

  it('maps full API records with notes', () => {
    const applicant = applicantFromApi({
      id: 'a-4',
      skills: [],
      notes: 'Internal',
    });

    expect(applicant.notes).toBe('Internal');
  });

  it('maps arrays of API records', () => {
    const applicants = applicantsFromApi([
      { id: 'a-1', skills: [] },
      { id: 'a-2', skills: ['Go'] },
    ]);

    expect(applicants.map((a) => a.id)).toEqual(['a-1', 'a-2']);
  });

  it('omits invalid availability dates from write payloads', () => {
    const payload = applicantToApiWrite(
      createApplicant({
        id: 'a-3',
        availableFrom: new Date('invalid'),
        skills: [],
      })
    );

    expect(payload.availableFrom).toBeUndefined();
  });
});
