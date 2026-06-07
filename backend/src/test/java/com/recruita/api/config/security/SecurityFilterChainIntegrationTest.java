package com.recruita.api.config.security;

import static com.recruita.api.support.MockMvcApiRequests.postJson;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.recruita.api.config.properties.RecruitaProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityFilterChainIntegrationTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private RecruitaProperties recruitaProperties;

  @Test
  void deniesUnlistedRoutes() throws Exception {
    mockMvc.perform(get("/api/internal/admin")).andExpect(status().isForbidden());
  }

  @Test
  void allowsPublicHealthRoute() throws Exception {
    mockMvc.perform(get("/api/health")).andExpect(status().isOk());
  }

  @Test
  void allowsPreflightOptions() throws Exception {
    mockMvc
        .perform(
            options("/api/match")
                .header(HttpHeaders.ORIGIN, "http://localhost:4200")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
        .andExpect(status().isOk());
  }

  @Test
  void appliesSecurityHeadersOnPublicRoutes() throws Exception {
    mockMvc
        .perform(get("/api/health"))
        .andExpect(status().isOk())
        .andExpect(header().string("X-Content-Type-Options", "nosniff"))
        .andExpect(
            header()
                .string("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'"))
        .andExpect(header().string("Cross-Origin-Opener-Policy", "same-origin"))
        .andExpect(header().string("Cross-Origin-Resource-Policy", "same-origin"))
        .andExpect(header().string("X-Frame-Options", "DENY"))
        .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"))
        .andExpect(header().exists("Permissions-Policy"))
        .andExpect(
            header().string("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate"));
  }

  @Test
  void appliesSecurityHeadersOnMatchRoute() throws Exception {
    String body =
        """
        {
          "jobDescription": "Engineer",
          "deterministic": true,
          "candidates": [{"id": "a", "skills": ["java"]}]
        }
        """;

    mockMvc
        .perform(postJson("/api/match", body))
        .andExpect(status().isOk())
        .andExpect(header().string("X-Content-Type-Options", "nosniff"))
        .andExpect(header().exists("Content-Security-Policy"));
  }

  @Test
  void rejectsMutatingRequestsWithoutCsrfToken() throws Exception {
    String body =
        """
        {
          "jobDescription": "Engineer",
          "deterministic": true,
          "candidates": [{"id": "a", "skills": ["java"]}]
        }
        """;

    mockMvc
        .perform(post("/api/match").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isForbidden());
  }

  @Test
  void issuesCsrfCookieOnSafeRequests() throws Exception {
    String cookieName = recruitaProperties.getSecurity().getCsrf().getCookieName();

    mockMvc
        .perform(get("/api/health"))
        .andExpect(status().isOk())
        .andExpect(cookie().exists(cookieName));
  }
}
