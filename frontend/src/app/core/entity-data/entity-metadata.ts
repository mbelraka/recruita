import { EntityMetadataMap } from '@ngrx/data';

import { RecruitaEntityNames } from './recruita-entity-names.constants';

export const recruitaEntityMetadata: EntityMetadataMap = {
  [RecruitaEntityNames.Applicant]: {},
  [RecruitaEntityNames.Profile]: {},
};
