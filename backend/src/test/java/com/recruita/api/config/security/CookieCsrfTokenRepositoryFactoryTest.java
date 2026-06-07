package com.recruita.api.config.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.recruita.api.config.properties.SecurityProperties;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;

class CookieCsrfTokenRepositoryFactoryTest {

  @Test
  void createsRepositoryFromProperties() {
    SecurityProperties.CsrfProperties csrf = new SecurityProperties.CsrfProperties();
    csrf.setCookieName("CUSTOM-CSRF");
    csrf.setHeaderName("X-CUSTOM-CSRF");
    csrf.setParameterName("_customCsrf");
    csrf.setCookieHttpOnly(false);

    CookieCsrfTokenRepository repository = CookieCsrfTokenRepositoryFactory.create(csrf);
    MockHttpServletRequest request = new MockHttpServletRequest();
    MockHttpServletResponse response = new MockHttpServletResponse();

    CsrfToken token = repository.generateToken(request);
    repository.saveToken(token, request, response);

    Cookie cookie = response.getCookie("CUSTOM-CSRF");
    assertNotNull(cookie);
    assertFalse(cookie.isHttpOnly());
    assertEquals("X-CUSTOM-CSRF", token.getHeaderName());
    assertEquals("_customCsrf", token.getParameterName());
  }
}
