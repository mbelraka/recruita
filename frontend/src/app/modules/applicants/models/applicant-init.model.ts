import { ApplicationStatus } from '../enums/application-status.enum';
import { Applicant } from './applicant.model';

export type ApplicantInit = Partial<
  Omit<Applicant, 'applicationStatus' | 'yearsOfExperience' | 'availableFrom'>
> & {
  firstName?: string;
  lastName?: string;
  yearsOfExperience?: number | string | null;
  availableFrom?: Date | string | number | null;
  applicationStatus?: string | ApplicationStatus | null;
};
