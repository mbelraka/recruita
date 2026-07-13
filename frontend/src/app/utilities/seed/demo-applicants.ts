import { ApplicationStatus } from '../../modules/applicants/enums/application-status.enum';
import { Applicant } from '../../modules/applicants/models/applicant.model';
import { createApplicant } from '../../modules/applicants/utilities/applicant-domain.util';
import applicantsDemo from './applicants-demo.json';

/** Wire shape shared with backend `seed/applicants-demo.json`. */
interface DemoApplicantSeed {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly location: string;
  readonly yearsOfExperience: number;
  readonly applicationStatus: ApplicationStatus;
  readonly currentJobTitle: string;
  readonly availableFrom: string;
  readonly skills: string[];
  readonly notes: string;
}

/** Demo roster for Playwright API mocks (not loaded automatically by the app). */
export function buildDemoApplicants(): Applicant[] {
  return (applicantsDemo as DemoApplicantSeed[]).map((seed) =>
    createApplicant({
      ...seed,
      availableFrom: new Date(seed.availableFrom),
    })
  );
}
