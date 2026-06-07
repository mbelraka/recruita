package com.recruita.api.action.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.recruita.api.action.model.ParseActionCommandRequest;
import com.recruita.api.common.enums.UiLanguage;
import com.recruita.api.match.groq.GroqChatClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class ActionParseApplicationServiceTest {

  @Autowired private ActionParseApplicationService service;

  @MockitoBean private GroqChatClient groqChatClient;

  @Test
  void parseReturnsValidationErrorsForMalformedLlmJson() {
    when(groqChatClient.complete(any())).thenReturn("not-json");

    var response = service.parse(new ParseActionCommandRequest("find devs", UiLanguage.EN));

    assertThat(response.valid()).isFalse();
    assertThat(response.errors()).contains("Failed to parse LLM response as JSON");
  }

  @Test
  void parseReturnsValidatedAction() {
    when(groqChatClient.complete(any()))
        .thenReturn("{\"type\":\"FILTER_APPLICANTS\",\"params\":{\"skills\":[\"React\"]}}");

    var response = service.parse(new ParseActionCommandRequest("find react devs", UiLanguage.DE));

    assertThat(response.valid()).isTrue();
    assertThat(response.action()).containsEntry("type", "FILTER_APPLICANTS");
  }
}
