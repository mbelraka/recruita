package com.recruita.api.config.security;

import com.recruita.api.config.properties.SecurityProperties;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.stereotype.Component;

/** Applies CSRF protection for SPA clients (cookie token + header validation). */
@Component
public class CsrfSecurityConfigurer {

  public void apply(HttpSecurity http, SecurityProperties.CsrfProperties csrf) throws Exception {
    if (!csrf.isEnabled()) {
      http.csrf(AbstractHttpConfigurer::disable);
      return;
    }

    CookieCsrfTokenRepository repository = CookieCsrfTokenRepositoryFactory.create(csrf);
    http.csrf(
            csrfConfigurer ->
                csrfConfigurer
                    .csrfTokenRepository(repository)
                    .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())
                    .requireCsrfProtectionMatcher(new MutatingHttpMethodCsrfProtectionMatcher()))
        .addFilterBefore(new CsrfCookieIssuingFilter(repository), CsrfFilter.class);
  }
}
