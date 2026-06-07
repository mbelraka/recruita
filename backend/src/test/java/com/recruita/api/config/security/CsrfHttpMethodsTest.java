package com.recruita.api.config.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class CsrfHttpMethodsTest {

  @Test
  void safeMethodsDoNotRequireProtection() {
    assertFalse(CsrfHttpMethods.requiresProtection("GET"));
    assertFalse(CsrfHttpMethods.requiresProtection("HEAD"));
    assertFalse(CsrfHttpMethods.requiresProtection("OPTIONS"));
    assertFalse(CsrfHttpMethods.requiresProtection("TRACE"));
  }

  @Test
  void mutatingMethodsRequireProtection() {
    assertTrue(CsrfHttpMethods.requiresProtection("POST"));
    assertTrue(CsrfHttpMethods.requiresProtection("PUT"));
    assertTrue(CsrfHttpMethods.requiresProtection("DELETE"));
    assertTrue(CsrfHttpMethods.requiresProtection("PATCH"));
  }
}
