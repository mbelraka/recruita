package com.recruita.api.action.model;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/** Wire values for applicant status fields in smart-action payloads. */
public enum ApplicationStatusWire {
  RECEIVED("received"),
  SCREENING("screening"),
  INTERVIEW_SCHEDULED("interview_scheduled"),
  SHORTLISTED("shortlisted"),
  OFFER_EXTENDED("offer_extended"),
  REJECTED("rejected"),
  WITHDRAWN("withdrawn");

  private static final Set<String> WIRE_VALUES =
      Arrays.stream(values()).map(ApplicationStatusWire::wireValue).collect(Collectors.toSet());

  private final String wireValue;

  ApplicationStatusWire(String wireValue) {
    this.wireValue = wireValue;
  }

  public String wireValue() {
    return wireValue;
  }

  public static boolean isWireValue(String value) {
    return value != null && WIRE_VALUES.contains(value);
  }

  public static String formatList() {
    return Arrays.stream(values())
        .map(ApplicationStatusWire::wireValue)
        .collect(Collectors.joining(", "));
  }

  public static String joinedPipe() {
    return Arrays.stream(values())
        .map(ApplicationStatusWire::wireValue)
        .collect(Collectors.joining("|"));
  }
}
