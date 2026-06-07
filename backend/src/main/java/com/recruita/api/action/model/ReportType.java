package com.recruita.api.action.model;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/** Report kinds for GENERATE_REPORT smart actions. */
public enum ReportType {
  PIPELINE_SUMMARY("pipeline_summary"),
  SKILLS_DISTRIBUTION("skills_distribution"),
  EXPERIENCE_ANALYSIS("experience_analysis");

  private static final Set<String> WIRE_VALUES =
      Arrays.stream(values()).map(ReportType::wireValue).collect(Collectors.toSet());

  private final String wireValue;

  ReportType(String wireValue) {
    this.wireValue = wireValue;
  }

  public String wireValue() {
    return wireValue;
  }

  public static boolean isWireValue(String value) {
    return value != null && WIRE_VALUES.contains(value);
  }

  public static String joinedPipe() {
    return Arrays.stream(values()).map(ReportType::wireValue).collect(Collectors.joining("|"));
  }
}
