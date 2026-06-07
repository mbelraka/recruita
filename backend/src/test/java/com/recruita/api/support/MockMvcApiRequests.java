package com.recruita.api.support;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** Shared MockMvc builders for JSON API calls protected by CSRF. */
public final class MockMvcApiRequests {

  private MockMvcApiRequests() {}

  public static MockHttpServletRequestBuilder postJson(String path, String body) {
    return post(path).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body);
  }
}
