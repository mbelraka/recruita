package com.recruita.api.config.security;

import java.util.Locale;
import java.util.Set;
import org.springframework.http.HttpMethod;

/** HTTP verbs that do not require a CSRF token (safe reads and CORS preflight). */
public final class CsrfHttpMethods {

  public static final Set<String> SAFE_METHODS =
      Set.of(HttpMethod.GET.name(), HttpMethod.HEAD.name(), HttpMethod.OPTIONS.name(), "TRACE");

  private CsrfHttpMethods() {}

  public static boolean requiresProtection(String method) {
    return method != null && !SAFE_METHODS.contains(method.toUpperCase(Locale.ROOT));
  }
}
