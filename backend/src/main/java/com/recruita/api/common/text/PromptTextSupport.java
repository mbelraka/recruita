package com.recruita.api.common.text;

import java.util.List;

/** Helpers for assembling multi-line LLM prompts with {@link StringBuilder}. */
public final class PromptTextSupport {

  private PromptTextSupport() {}

  public static StringBuilder newBuffer(int initialCapacity) {
    return new StringBuilder(initialCapacity);
  }

  public static void appendLine(StringBuilder buffer, String line) {
    buffer.append(line).append('\n');
  }

  public static void appendBlankLine(StringBuilder buffer) {
    buffer.append('\n');
  }

  public static void appendParagraph(StringBuilder buffer, String paragraph) {
    if (!buffer.isEmpty()) {
      buffer.append("\n\n");
    }
    buffer.append(paragraph);
  }

  public static String joinCommaSeparated(List<String> values, String emptyLabel) {
    if (values == null || values.isEmpty()) {
      return emptyLabel;
    }

    StringBuilder joined = new StringBuilder();
    for (int index = 0; index < values.size(); index++) {
      if (index > 0) {
        joined.append(", ");
      }
      joined.append(values.get(index));
    }
    return joined.toString();
  }
}
