import { ApplicationStatus } from '../../applicants/enums/application-status.enum';

export interface FilterParams {
  readonly skills?: readonly string[];
  readonly minExperience?: number;
  readonly maxExperience?: number;
  readonly status?: ApplicationStatus;
  readonly location?: string;
  readonly searchTerm?: string;
}
