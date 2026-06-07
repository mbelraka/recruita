package com.recruita.api.common.text;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class PromptTextSupportTest {

  @Test
  void appendsParagraphsWithBlankLineSeparators() {
    StringBuilder buffer = PromptTextSupport.newBuffer(64);
    PromptTextSupport.appendParagraph(buffer, "First");
    PromptTextSupport.appendParagraph(buffer, "Second");

    assertThat(buffer.toString()).isEqualTo("First\n\nSecond");
  }

  @Test
  void joinsCommaSeparatedValuesOrEmptyLabel() {
    assertThat(PromptTextSupport.joinCommaSeparated(List.of("USA", "Canada"), "(none)"))
        .isEqualTo("USA, Canada");
    assertThat(PromptTextSupport.joinCommaSeparated(List.of(), "(none loaded)"))
        .isEqualTo("(none loaded)");
  }
}
