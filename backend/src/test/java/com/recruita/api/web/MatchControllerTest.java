package com.recruita.api.web;

import static com.recruita.api.support.MockMvcApiRequests.postJson;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class MatchControllerTest {

  @Autowired private MockMvc mockMvc;

  @Test
  void matchRequiresJobDescription() throws Exception {
    mockMvc
        .perform(postJson("/api/match", "{\"candidates\":[]}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("jobDescription is required."));
  }

  @Test
  void deterministicMatchReturnsScores() throws Exception {
    String body =
        """
        {
          "jobDescription": "Senior engineer with 5+ years and angular typescript skills",
          "deterministic": true,
          "candidates": [
            {
              "id": "corr-1",
              "skills": ["angular", "typescript"],
              "yearsOfExperience": 6,
              "currentJobTitle": "Senior Engineer"
            }
          ]
        }
        """;

    mockMvc
        .perform(postJson("/api/match", body))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.scores[0].id").value("corr-1"))
        .andExpect(jsonPath("$.scores[0].matchScore").isNumber())
        .andExpect(jsonPath("$.scores[0].recommendation").isString());
  }

  @Test
  void rejectsInvalidModelParameter() throws Exception {
    String body =
        """
        {
          "jobDescription": "Engineer",
          "deterministic": true,
          "model": "bad model!",
          "candidates": [{"id": "a", "skills": ["java"]}]
        }
        """;

    mockMvc
        .perform(postJson("/api/match", body))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Model parameter format is invalid."));
  }

  @Test
  void legacyRouteWorks() throws Exception {
    String body =
        """
        {
          "jobDescription": "Backend role",
          "deterministic": true,
          "candidates": [{"id": "a", "skills": ["java"]}]
        }
        """;

    mockMvc
        .perform(postJson("/api/match-job", body))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.scores[0].id").value("a"));
  }
}
