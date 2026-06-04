import { EntityHttpResourceUrls } from '@ngrx/data';

import { APP_CONFIG } from '../../config/app.config';
import { RecruitaEntityNames } from './recruita-entity-names';

/** Shared REST paths for NgRx Data URL generation and DefaultDataServiceFactory. */
export const recruitaEntityHttpResourceUrls: EntityHttpResourceUrls = {
  [RecruitaEntityNames.Applicant]: {
    collectionResourceUrl: APP_CONFIG.APPLICANTS.API.BASE_PATH,
    entityResourceUrl: `${APP_CONFIG.APPLICANTS.API.BASE_PATH}/`,
  },
  [RecruitaEntityNames.Profile]: {
    collectionResourceUrl: APP_CONFIG.PROFILE.API.BASE_PATH,
    entityResourceUrl: `${APP_CONFIG.PROFILE.API.BASE_PATH}/`,
  },
};
