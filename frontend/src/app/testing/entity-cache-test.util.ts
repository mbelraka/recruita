import { EntityCache } from '@ngrx/data';

import { RecruitaEntityNames } from '../core/entity-data/recruita-entity-names';
import { ENTITY_CACHE_STATE_KEY } from '../core/entity-data/entity-cache.selectors';
import type { Profile } from '../modules/main/models/profile.model';
import { Applicant } from '../modules/applicants/models/applicant.model';

type TestEntityCollection<T> = {
  ids: string[];
  entities: Record<string, T>;
  loading: boolean;
  loaded: boolean;
};

export function buildApplicantEntityCache(
  applicants: Applicant[],
  options: { loading?: boolean; loaded?: boolean } = {}
): EntityCache {
  const collection: TestEntityCollection<Applicant> = {
    ids: applicants.map((applicant) => applicant.id),
    entities: Object.fromEntries(
      applicants.map((applicant) => [applicant.id, applicant])
    ),
    loading: options.loading ?? false,
    loaded: options.loaded ?? true,
  };

  return {
    [RecruitaEntityNames.Applicant]: collection,
  } as unknown as EntityCache;
}

export function buildProfileEntityCache(
  profile: Profile | null,
  options: { loading?: boolean; loaded?: boolean } = {}
): EntityCache {
  const entities = profile ? { [profile.id]: profile } : {};
  const ids = profile ? [profile.id] : [];
  const collection: TestEntityCollection<Profile> = {
    ids,
    entities,
    loading: options.loading ?? false,
    loaded: options.loaded ?? profile != null,
  };

  return {
    [RecruitaEntityNames.Profile]: collection,
  } as unknown as EntityCache;
}

export function withEntityCache(cache: EntityCache): {
  [ENTITY_CACHE_STATE_KEY]: EntityCache;
} {
  return { [ENTITY_CACHE_STATE_KEY]: cache };
}

export function mergeEntityCaches(...caches: EntityCache[]): EntityCache {
  return Object.assign({}, ...caches) as EntityCache;
}
