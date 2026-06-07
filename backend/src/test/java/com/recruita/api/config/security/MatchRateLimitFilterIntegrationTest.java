package com.recruita.api.config.security;

import static com.recruita.api.support.MockMvcApiRequests.postJson;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = "recruita.security.rate-limit.max-requests=1")
class MatchRateLimitFilterIntegrationTest {

  @Autowired private MockMvc mockMvc;

  @Test
  void rejectsRequestsAboveConfiguredLimit() throws Exception {
    String body =
        """
        {
          "jobDescription": "Engineer",
          "deterministic": true,
          "candidates": [{"id": "a", "skills": ["java"]}]
        }
        """;

    mockMvc.perform(postJson("/api/match", body)).andExpect(status().isOk());

    mockMvc
        .perform(postJson("/api/match", body))
        .andExpect(status().isTooManyRequests())
        .andExpect(
            jsonPath("$.error")
                .value("Too many match requests from this IP, please try again later."));
  }
}
