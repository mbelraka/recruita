package com.recruita.api.config.security;

import com.recruita.api.config.properties.SecurityProperties;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

/** Builds a {@link CookieCsrfTokenRepository} from {@link SecurityProperties.CsrfProperties}. */
public final class CookieCsrfTokenRepositoryFactory {

  private CookieCsrfTokenRepositoryFactory() {}

  public static CookieCsrfTokenRepository create(SecurityProperties.CsrfProperties csrf) {
    CookieCsrfTokenRepository repository =
        csrf.isCookieHttpOnly()
            ? new CookieCsrfTokenRepository()
            : CookieCsrfTokenRepository.withHttpOnlyFalse();
    repository.setCookieName(csrf.getCookieName());
    repository.setHeaderName(csrf.getHeaderName());
    repository.setParameterName(csrf.getParameterName());
    return repository;
  }
}
