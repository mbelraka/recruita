import { createEntityCacheSelector, EntityCollection } from '@ngrx/data';
import { createSelector } from '@ngrx/store';

import { RecruitaEntityName } from './recruita-entity-names';

export const ENTITY_CACHE_STATE_KEY = 'entityCache';

const selectEntityCache = createEntityCacheSelector(ENTITY_CACHE_STATE_KEY);

export function selectEntityCollection<T>(entityName: RecruitaEntityName) {
  return createSelector(
    selectEntityCache,
    (cache) => cache?.[entityName] as EntityCollection<T> | undefined
  );
}

export function selectAllFromEntityCollection<T>(
  entityName: RecruitaEntityName
) {
  return createSelector(selectEntityCollection<T>(entityName), (collection) => {
    if (!collection?.ids?.length) {
      return [] as T[];
    }
    return collection.ids
      .map((id) => collection.entities[id])
      .filter((entity): entity is T => entity != null);
  });
}

export function selectEntityCollectionLoading(entityName: RecruitaEntityName) {
  return createSelector(
    selectEntityCollection(entityName),
    (collection) => !!collection?.loading
  );
}

export function selectEntityCollectionLoaded(entityName: RecruitaEntityName) {
  return createSelector(
    selectEntityCollection(entityName),
    (collection) => !!collection?.loaded
  );
}
