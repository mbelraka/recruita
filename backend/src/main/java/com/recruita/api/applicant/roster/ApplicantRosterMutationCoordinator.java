package com.recruita.api.applicant.roster;

import com.recruita.api.match.cache.MatchResponseCache;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "recruita.persistence", name = "enabled", havingValue = "true")
public class ApplicantRosterMutationCoordinator implements RosterMutationCoordinator {

  private final RosterVersionService rosterVersionService;
  private final MatchResponseCache matchResponseCache;

  public ApplicantRosterMutationCoordinator(
      RosterVersionService rosterVersionService, MatchResponseCache matchResponseCache) {
    this.rosterVersionService = rosterVersionService;
    this.matchResponseCache = matchResponseCache;
  }

  @Override
  public void onRosterMutation() {
    rosterVersionService.bump();
    matchResponseCache.invalidateAll();
  }
}
