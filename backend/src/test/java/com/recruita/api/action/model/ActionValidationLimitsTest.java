package com.recruita.api.action.model;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ActionValidationLimitsTest {

  @Test
  void acceptsValidEmails() {
    assertThat(ActionValidationLimits.isValidEmail("jane@example.com")).isTrue();
  }

  @Test
  void rejectsInvalidEmails() {
    assertThat(ActionValidationLimits.isValidEmail("no-at-sign")).isFalse();
    assertThat(ActionValidationLimits.isValidEmail("a@b")).isFalse();
    assertThat(ActionValidationLimits.isValidEmail("a@.com")).isFalse();
  }
}
