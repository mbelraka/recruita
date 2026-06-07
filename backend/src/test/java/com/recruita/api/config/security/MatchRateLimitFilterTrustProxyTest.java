package com.recruita.api.config.security;

import static com.recruita.api.support.MockMvcApiRequests.postJson;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(
    properties = {
      "recruita.security.http.trust-proxy=1",
      "recruita.security.rate-limit.max-requests=10"
    })
class MatchRateLimitFilterTrustProxyTest {

  @Autowired private MockMvc mockMvc;

  @Test
  void rateLimitsByForwardedClientIpWhenTrustProxyEnabled() throws Exception {
    String body =
        """
        {
          "jobDescription": "Engineer",
          "deterministic": true,
          "candidates": [{"id": "a", "skills": ["java"]}]
        }
        """;

    mockMvc
        .perform(postJson("/api/match", body).header("X-Forwarded-For", "203.0.113.10"))
        .andExpect(status().isOk());

    mockMvc
        .perform(postJson("/api/match", body).header("X-Forwarded-For", "203.0.113.11"))
        .andExpect(status().isOk());
  }
}
