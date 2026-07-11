package com.recruita.api.applicant.roster;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class InMemoryRosterVersionServiceTest {

  private final InMemoryRosterVersionService service = new InMemoryRosterVersionService();

  @Test
  void startsAtZero() {
    assertEquals(0L, service.current());
  }

  @Test
  void bumpIncrementsAndReturnsNewValue() {
    assertEquals(1L, service.bump());
    assertEquals(2L, service.bump());
    assertEquals(2L, service.current());
  }
}
