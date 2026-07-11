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
    assertThat(result.action()).isInstanceOf(MatchJobActionDto.class);
    assertThat(ActionValidationResult.invalid(List.of("bad")).errors()).containsExactly("bad");
  }

  @Test
  void parseActionResponseFromValidationResult() {
    ParseActionResponse response =
        ParseActionResponse.from(
            ActionValidationResult.valid(
                new MatchJobActionDto(new MatchJobParamsDto("Engineer role", null))));

    assertThat(response.valid()).isTrue();
    assertThat(response.action()).isInstanceOf(MatchJobActionDto.class);
    assertThat(response.action().type()).isEqualTo(ActionType.MATCH_JOB);
  }
}
