package com.recruita.api.applicant.service;

import com.recruita.api.applicant.roster.RosterVersionService;
import com.recruita.api.applicant.roster.RosterWatermark;
import com.recruita.api.persistence.repository.ApplicantRepository;
import java.time.Instant;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "recruita.persistence", name = "enabled", havingValue = "true")
public class RosterWatermarkService {

  private final ApplicantRepository repository;
  private final RosterVersionService rosterVersionService;

  public RosterWatermarkService(
      ApplicantRepository repository, RosterVersionService rosterVersionService) {
    this.repository = repository;
    this.rosterVersionService = rosterVersionService;
  }

  public RosterWatermark current() {
    long version = rosterVersionService.current();
    Instant lastModified = repository.findMaxUpdatedAt().orElse(Instant.EPOCH);
    long count = repository.count();
    return new RosterWatermark(
        version, formatEtag(version, lastModified, count), lastModified, count);
  }

  static String formatEtag(long version, Instant lastModified, long count) {
    return "\"roster-v" + version + '-' + lastModified.toEpochMilli() + '-' + count + '"';
  }
}
