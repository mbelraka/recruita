package com.recruita.api.action.model;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/** Wire values for EXPORT_DATA format fields in smart-action payloads. */
public enum ExportFormatWire {
  CSV("csv"),
  JSON("json"),
  EXCEL("excel"),
  PDF("pdf");

  private static final Set<String> WIRE_VALUES =
      Arrays.stream(values()).map(ExportFormatWire::wireValue).collect(Collectors.toSet());

  private final String wireValue;

  ExportFormatWire(String wireValue) {
    this.wireValue = wireValue;
  }

  public String wireValue() {
    return wireValue;
  }

  public static boolean isWireValue(String value) {
    return value != null && WIRE_VALUES.contains(value);
  }

  public static String joinedPipe() {
    return Arrays.stream(values())
        .map(ExportFormatWire::wireValue)
        .collect(Collectors.joining("|"));
  }
}
