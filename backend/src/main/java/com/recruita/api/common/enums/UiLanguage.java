package com.recruita.api.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum UiLanguage {
  EN("en"),
  DE("de"),
  FR("fr"),
  IT("it"),
  RM("rm"),
  ES("es");

  private final String code;

  UiLanguage(String code) {
    this.code = code;
  }

  @JsonValue
  public String code() {
    return code;
  }

  @JsonCreator
  public static UiLanguage fromCode(String code) {
    if (code == null) {
      return null;
    }
    for (UiLanguage language : values()) {
      if (language.code.equals(code)) {
        return language;
      }
    }
    throw new IllegalArgumentException("Unsupported UI language: " + code);
  }
}
