package com.recruita.api.config.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.util.matcher.RequestMatcher;

/** Requires CSRF tokens for mutating HTTP methods (see {@link CsrfHttpMethods}). */
public final class MutatingHttpMethodCsrfProtectionMatcher implements RequestMatcher {

  @Override
  public boolean matches(HttpServletRequest request) {
    return CsrfHttpMethods.requiresProtection(request.getMethod());
  }
}
