import { isValidApplicant } from '../../modules/applicants/utilities/applicant-domain.util';
import { buildDemoApplicants } from './demo-applicants';

describe('demo-applicants', () => {
  it('builds the canonical demo roster', () => {
    const demos = buildDemoApplicants();
    expect(demos.length).toBe(11);
    expect(isValidApplicant(demos[0])).toBeTrue();
  });
});
