package com.recruita.api.applicant.roster;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.match.cache.MatchResponseCache;
import com.recruita.api.match.cache.StableJsonCanonicalizer;
import com.recruita.api.match.cache.store.MatchResponseCacheStore;
import org.junit.jupiter.api.Test;

class ApplicantRosterMutationCoordinatorTest {

  @Test
  void onRosterMutationBumpsVersionAndClearsMatchCache() {
    RecruitaProperties properties = new RecruitaProperties();
    RosterVersionService versionService = mock(RosterVersionService.class);
    MatchResponseCacheStore store = mock(MatchResponseCacheStore.class);
    MatchResponseCache matchResponseCache =
        new MatchResponseCache(
            properties,
            new StableJsonCanonicalizer(properties, new ObjectMapper()),
            store,
            versionService);
    ApplicantRosterMutationCoordinator coordinator =
        new ApplicantRosterMutationCoordinator(versionService, matchResponseCache);

    coordinator.onRosterMutation();

    verify(versionService).bump();
    verify(store).invalidateAll();
  }
}
