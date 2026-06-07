package com.recruita.api.config.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class MutatingHttpMethodCsrfProtectionMatcherTest {

  private final MutatingHttpMethodCsrfProtectionMatcher matcher =
      new MutatingHttpMethodCsrfProtectionMatcher();

  @Test
  void delegatesToCsrfHttpMethods() {
    assertFalse(matcher.matches(new MockHttpServletRequest("GET", "/api/health")));
    assertTrue(matcher.matches(new MockHttpServletRequest("POST", "/api/match")));
  }
}
