package com.recruita.api.action.prompt;

import static org.assertj.core.api.Assertions.assertThat;

import com.recruita.api.action.model.ApplicationStatusWire;
import com.recruita.api.action.model.ExportFormatWire;
import com.recruita.api.config.properties.RecruitaProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ActionPromptFactoryTest {

  @Autowired private ActionPromptFactory promptFactory;

  @Autowired private RecruitaProperties properties;

  @Test
  void systemPromptIncludesCatalogFromEnumsAndConfiguration() {
    String prompt = promptFactory.systemPrompt();

    assertThat(prompt).contains("FILTER_APPLICANTS");
    assertThat(prompt).contains("pipeline_summary");
    assertThat(prompt).contains(ApplicationStatusWire.joinedPipe());
    assertThat(prompt).contains(ExportFormatWire.joinedPipe());
    assertThat(prompt)
        .contains(String.valueOf(properties.getAction().getValidation().getMatchLimitDefault()));
  }

  @Test
  void userPromptWrapsSanitizedCommand() {
    assertThat(promptFactory.userPrompt("Find React devs"))
        .isEqualTo("User command: \"Find React devs\"");
  }
}
