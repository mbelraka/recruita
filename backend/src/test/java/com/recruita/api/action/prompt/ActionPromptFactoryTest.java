package com.recruita.api.action.prompt;

import static org.assertj.core.api.Assertions.assertThat;

import com.recruita.api.action.model.ApplicationStatusWire;
import com.recruita.api.action.model.ExportFormatWire;
import com.recruita.api.common.enums.UiLanguage;
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
  void systemPromptIncludesLiveRosterContextSection() {
    String prompt = promptFactory.systemPrompt();

    assertThat(prompt).contains("ROSTER CONTEXT");
    assertThat(prompt).contains("Countries:");
    assertThat(prompt).contains("Skills:");
    assertThat(prompt).contains("Cities:");
  }

  @Test
  void systemPromptForbidsGuessingStatusFromRankingWords() {
    String prompt = promptFactory.systemPrompt();

    assertThat(prompt).contains("NEVER put US/USA/UK/Canada or any geography in searchTerm");
    assertThat(prompt).contains("show top applicants in the US");
    assertThat(prompt).contains("\"country\":\"USA\"");
  }

  @Test
  void systemPromptIncludesMultilingualFilterGuidance() {
    String prompt = promptFactory.systemPrompt();

    assertThat(prompt).contains("any supported UI language");
    assertThat(prompt).contains("Entwickler in Deutschland");
  }

  @Test
  void userPromptIncludesLanguageAndSanitizedCommand() {
    assertThat(promptFactory.userPrompt("Find React devs", UiLanguage.EN))
        .isEqualTo("User language: en\nUser command: \"Find React devs\"");
    assertThat(promptFactory.userPrompt("Entwickler in Deutschland", UiLanguage.DE))
        .contains("User language: de")
        .contains("Entwickler in Deutschland");
  }
}
