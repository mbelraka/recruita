package com.recruita.api.api.advice;

import static com.recruita.api.support.MockMvcApiRequests.postJson;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.recruita.api.common.exception.ApplicantConflictException;
import com.recruita.api.common.exception.ApplicantNotFoundException;
import com.recruita.api.match.groq.GroqChatClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class GlobalApiExceptionHandlerTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private GlobalApiExceptionHandler handler;

  @MockitoBean private GroqChatClient groqChatClient;

  @Test
  void handleNotFoundReturnsProblemDetail() {
    ProblemDetail detail = handler.handleNotFound();
    assertEquals(HttpStatus.NOT_FOUND.value(), detail.getStatus());
    assertEquals("Not found.", detail.getProperties().get("error"));
  }

  @Test
  void handleApplicantNotFoundReturnsProblemDetail() {
    ProblemDetail detail =
        handler.handleApplicantNotFound(new ApplicantNotFoundException("Applicant not found."));
    assertEquals(HttpStatus.NOT_FOUND.value(), detail.getStatus());
  }

  @Test
  void handleApplicantConflictReturnsProblemDetail() {
    ProblemDetail detail =
        handler.handleApplicantConflict(
            new ApplicantConflictException("An applicant with this id already exists."));
    assertEquals(HttpStatus.CONFLICT.value(), detail.getStatus());
  }

  @Test
  void invalidJsonReturnsConfiguredMessage() throws Exception {
    mockMvc
        .perform(postJson("/api/match", "{"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Request body must be valid JSON."));
  }

  @Test
  void handlePolicyValidationReturnsMessage() {
    ProblemDetail detail =
        handler.handlePolicyValidation(
            new com.recruita.api.common.exception.MatchValidationException("bad input"));
    assertEquals("bad input", detail.getProperties().get("error"));
  }

  @Test
  void nonDeterministicMatchReturnsServiceUnavailableWhenGroqFails() throws Exception {
    org.mockito.Mockito.when(groqChatClient.complete(org.mockito.ArgumentMatchers.any()))
        .thenThrow(new RuntimeException("boom"));

    String body =
        """
        {
          "jobDescription": "Engineer",
          "deterministic": false,
          "candidates": [{"id": "x", "skills": ["java"]}]
        }
        """;

    mockMvc
        .perform(postJson("/api/match", body))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").value("boom"));
  }
}
