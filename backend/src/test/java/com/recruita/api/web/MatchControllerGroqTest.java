package com.recruita.api.web;

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
class MatchControllerGroqTest {

  @Autowired private MockMvc mockMvc;

  @MockitoBean private GroqChatClient groqChatClient;

  @Test
  void groqMatchReturnsParsedPayload() throws Exception {
    when(groqChatClient.complete(any()))
        .thenReturn("{\"scores\":[{\"id\":\"1\",\"matchScore\":90}]}");

    String body =
        """
        {
          "jobDescription": "Need Angular dev",
          "candidates": [{"id": "1", "skills": ["angular"]}]
        }
        """;

    mockMvc
        .perform(postJson("/api/match", body))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.scores[0].id").value("1"))
        .andExpect(jsonPath("$.scores[0].matchScore").value(90));
  }

  @Test
  void groqInvalidJsonReturnsEmptyObject() throws Exception {
    when(groqChatClient.complete(any())).thenReturn("not-json");

    String body =
        """
        {
          "jobDescription": "Need Angular dev",
          "candidates": [{"id": "1", "skills": ["angular"]}]
        }
        """;

    mockMvc
        .perform(postJson("/api/match", body))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.scores").doesNotExist());
  }
}
