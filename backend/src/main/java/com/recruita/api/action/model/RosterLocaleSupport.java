package com.recruita.api.action.model;

import java.util.Locale;

/** Locale-insensitive text normalization for roster label and city keys. */
public final class RosterLocaleSupport {

  private static final Locale ROOT = Locale.ROOT;

  private RosterLocaleSupport() {}

  public static String normalizeKey(String text) {
    if (text == null) {
      return "";
    }
    return text.trim().toLowerCase(ROOT);
  }

  public static boolean labelsEqual(String left, String right) {
    return normalizeKey(left).equals(normalizeKey(right));
  }
}
