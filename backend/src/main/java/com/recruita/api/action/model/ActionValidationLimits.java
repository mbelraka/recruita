package com.recruita.api.action.model;

/** Compile-time limits referenced by Bean Validation and action validators. */
public final class ActionValidationLimits {

  public static final int MAX_COMMAND_LENGTH = 500;

  private static final int EMAIL_AT_MIN_INDEX = 1;
  private static final int EMAIL_DOMAIN_DOT_MIN_OFFSET_FROM_AT = 2;

  private ActionValidationLimits() {}

  public static boolean isValidEmail(String email) {
    int at = email.indexOf('@');
    if (at < EMAIL_AT_MIN_INDEX) {
      return false;
    }
    int dot = email.indexOf('.', at + EMAIL_DOMAIN_DOT_MIN_OFFSET_FROM_AT);
    return dot > at + 1 && dot < email.length() - 1;
  }
}
