package com.recruita.api.applicant.roster;

/** Monotonic roster generation used for cache keys and conditional roster GET. */
public interface RosterVersionService {

  long current();

  long bump();
}
