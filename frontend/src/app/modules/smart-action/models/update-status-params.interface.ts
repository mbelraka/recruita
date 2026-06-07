import { ApplicationStatus } from '../../applicants/enums/application-status.enum';

export interface UpdateStatusParams {
  readonly applicantIdentifier: string;
  readonly newStatus: ApplicationStatus;
}
