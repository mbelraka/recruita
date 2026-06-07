package com.recruita.api.api.controller;

import static com.recruita.api.support.MockMvcApiRequests.postJson;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.recruita.api.match.groq.GroqChatClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ActionParserControllerTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private GroqChatClient groqChatClient;

  @Test
  void parseReturnsValidatedAction() throws Exception {
    when(groqChatClient.complete(any()))
        .thenReturn("{\"type\":\"FILTER_APPLICANTS\",\"params\":{\"skills\":[\"React\"]}}");

    String body =
        """
        {
          "command": "Find React developers",
          "language": "en"
        }
        """;

    mockMvc
        .perform(postJson("/api/action/parse", body))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.valid").value(true))
        .andExpect(jsonPath("$.action.type").value("FILTER_APPLICANTS"))
        .andExpect(jsonPath("$.action.params.skills[0]").value("React"))
        .andExpect(jsonPath("$.errors").isEmpty());
  }
}
