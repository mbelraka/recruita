package com.recruita.api.action.model;

import java.util.List;

/** Case-insensitive match of LLM tokens to roster labels (no alias tables). */
public final class RosterLabelMatcher {

  private RosterLabelMatcher() {}

  public static String match(String token, List<String> rosterLabels) {
    if (token == null || token.isBlank()) {
      return token;
    }
    if (rosterLabels == null || rosterLabels.isEmpty()) {
      return token.trim();
    }

    String trimmed = token.trim();
    for (String rosterLabel : rosterLabels) {
      if (RosterLocaleSupport.labelsEqual(rosterLabel, trimmed)) {
        return rosterLabel;
      }
    }

    return trimmed;
  }
}
