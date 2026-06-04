import { createApplicant } from './applicant-domain.util';
import { applicantGlobalSearchHaystack } from './applicant-global-search.util';

describe('applicantGlobalSearchHaystack', () => {
  it('matches summary roster fields', () => {
    const applicant = createApplicant({
      id: '1',
      name: 'Alex Kim',
      email: 'alex@example.com',
      skills: ['Angular'],
      currentJobTitle: 'Engineer',
    });

    expect(applicantGlobalSearchHaystack(applicant)).toContain('alex');
    expect(applicantGlobalSearchHaystack(applicant)).toContain('angular');
  });

  it('does not match notes when the roster row has no notes', () => {
    const applicant = createApplicant({
      id: '1',
      name: 'Alex',
      skills: ['Go'],
    });

    expect(applicantGlobalSearchHaystack(applicant)).not.toContain('secret');
  });

  it('includes notes when present in the entity cache (after detail load)', () => {
    const applicant = createApplicant({
      id: '1',
      name: 'Alex',
      notes: 'secret pipeline',
    });

    expect(applicantGlobalSearchHaystack(applicant)).toContain(
      'secret pipeline'
    );
  });
});
