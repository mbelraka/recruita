package com.recruita.api.applicant.roster;

import java.util.concurrent.atomic.AtomicLong;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(
    prefix = "recruita.persistence",
    name = "enabled",
    havingValue = "false",
    matchIfMissing = true)
public class InMemoryRosterVersionService implements RosterVersionService {

  private final AtomicLong version = new AtomicLong(0L);

  @Override
  public long current() {
    return version.get();
  }

  @Override
  public long bump() {
    return version.incrementAndGet();
  }
}
