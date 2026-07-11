package com.recruita.api.applicant.roster;

/** Bumps roster version and clears match cache after applicant mutations. */
public interface RosterMutationCoordinator {

  void onRosterMutation();
}
