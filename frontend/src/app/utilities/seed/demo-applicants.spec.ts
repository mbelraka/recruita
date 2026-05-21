import { buildDemoApplicants } from './demo-applicants';

describe('demo-applicants', () => {
  it('builds the canonical demo roster', () => {
    const demos = buildDemoApplicants();
    expect(demos.length).toBe(11);
    expect(demos[0].isValid()).toBeTrue();
  });
});
