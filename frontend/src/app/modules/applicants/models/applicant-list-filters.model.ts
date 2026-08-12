import { ApplicationStatus } from '../enums/application-status.enum';

export interface ApplicantListFilters {
  readonly globalFilter: string;
  readonly skill: string | null;
  readonly status: ApplicationStatus | null;
  readonly country: string | null;
  readonly minExperience?: number;
  readonly maxExperience?: number;
}
