package com.recruita.api.action.parse;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class LlmJsonPayloadParserTest {

  @Autowired private LlmJsonPayloadParser parser;

  @Test
  void parsesPlainJson() {
    assertThat(parser.parse("{\"type\":\"CLARIFY\"}").get("type").asText()).isEqualTo("CLARIFY");
  }

  @Test
  void stripsMarkdownFences() {
    assertThat(parser.parse("```json\n{\"type\":\"CLARIFY\"}\n```").get("type").asText())
        .isEqualTo("CLARIFY");
  }

  @Test
  void returnsNullForInvalidJson() {
    assertThat(parser.parse("not json")).isNull();
  }

  @Test
  void returnsNullForBlankContent() {
    assertThat(parser.parse("   ")).isNull();
    assertThat(parser.parse(null)).isNull();
  }
}
