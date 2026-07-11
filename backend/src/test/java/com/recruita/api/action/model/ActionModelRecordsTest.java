package com.recruita.api.action.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class ActionModelRecordsTest {

  @Test
  void actionValidationResultCopiesErrors() {
    ActionValidationResult result =
        ActionValidationResult.valid(new MatchJobActionDto(new MatchJobParamsDto("Engineer", 5)));

    assertThat(result.valid()).isTrue();
    assertThat(result.action()).containsInstanceOf(MatchJobActionDto.class);
    assertThat(ActionValidationResult.invalid(List.of("bad")).action()).isEmpty();
    assertThat(ActionValidationResult.invalid(List.of("bad")).errors()).containsExactly("bad");
  }

  @Test
  void parseActionResponseFromValidationResult() {
    ParseActionResponse response =
        ParseActionResponse.from(
            ActionValidationResult.valid(
                new MatchJobActionDto(new MatchJobParamsDto("Engineer role", null))));

    assertThat(response.valid()).isTrue();
    assertThat(response.action()).containsInstanceOf(MatchJobActionDto.class);
    assertThat(response.action().orElseThrow().type()).isEqualTo(ActionType.MATCH_JOB);
  }

  @Test
  void invalidParseActionResponseOmitsActionFromJson() throws Exception {
    ParseActionResponse response =
        ParseActionResponse.from(ActionValidationResult.invalid(List.of("bad")));

    assertThat(response.action()).isEmpty();
    assertThat(
            new com.fasterxml.jackson.databind.ObjectMapper()
                .findAndRegisterModules()
                .writeValueAsString(response))
        .doesNotContain("\"action\"");
  }
}
