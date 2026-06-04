import { EntityDataService } from '@ngrx/data';

import { ApplicantDataService } from '../../modules/applicants/data/applicant-data.service';
import { ProfileDataService } from '../../modules/main/data/profile-data.service';
import { RecruitaEntityNames } from './recruita-entity-names';

/** Wires custom data services into NgRx Data (required for mapper + REST paths). */
export function registerRecruitaEntityDataServices(
  registry: EntityDataService,
  applicants: ApplicantDataService,
  profiles: ProfileDataService
): () => void {
  return () => {
    registry.registerService(RecruitaEntityNames.Applicant, applicants);
    registry.registerService(RecruitaEntityNames.Profile, profiles);
  };
}
