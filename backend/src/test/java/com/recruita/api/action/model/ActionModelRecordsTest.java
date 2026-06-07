package com.recruita.api.action.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ActionModelRecordsTest {

  @Test
  void actionValidationResultCopiesCollections() {
    Map<String, Object> mutable = new LinkedHashMap<>();
    mutable.put("type", "CLARIFY");
    ActionValidationResult result = ActionValidationResult.valid(mutable);
    mutable.put("hack", true);

    assertThat(result.action()).doesNotContainKey("hack");
    assertThat(ActionValidationResult.invalid(List.of("bad")).errors()).containsExactly("bad");
  }

  @Test
  void parseActionResponseFromValidationResult() {
    ParseActionResponse response =
        ParseActionResponse.from(
            ActionValidationResult.valid(Map.of("type", "MATCH_JOB", "params", Map.of())));

    assertThat(response.valid()).isTrue();
    assertThat(response.action()).containsEntry("type", "MATCH_JOB");
  }
}
