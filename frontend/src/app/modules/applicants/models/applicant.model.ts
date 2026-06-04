import { ApplicationStatus } from '../enums/application-status.enum';

export interface Applicant {
  readonly id: string;
  readonly name?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly location?: string;
  readonly yearsOfExperience?: number;
  readonly applicationStatus?: ApplicationStatus;
  readonly currentJobTitle?: string;
  readonly availableFrom?: Date;
  readonly skills?: string[];
  readonly notes?: string;
}
