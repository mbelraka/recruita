package com.recruita.api.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Ensures a CSRF cookie exists before {@link org.springframework.security.web.csrf.CsrfFilter} runs
 * so SPA clients can read {@code XSRF-TOKEN} on their first safe API request.
 */
final class CsrfCookieIssuingFilter extends OncePerRequestFilter {

  private final CsrfTokenRepository csrfTokenRepository;

  CsrfCookieIssuingFilter(CsrfTokenRepository csrfTokenRepository) {
    this.csrfTokenRepository = csrfTokenRepository;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    CsrfToken existing = csrfTokenRepository.loadToken(request);
    if (existing == null) {
      CsrfToken token = csrfTokenRepository.generateToken(request);
      csrfTokenRepository.saveToken(token, request, response);
    }
    filterChain.doFilter(request, response);
  }
}
