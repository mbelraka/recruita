package com.recruita.api.config.security;

import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.config.properties.SecurityProperties;
import java.util.ArrayList;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfigurationFactory {

  private final SecurityProperties.CorsProperties cors;
  private final SecurityProperties.CsrfProperties csrf;

  public CorsConfigurationFactory(RecruitaProperties properties) {
    this.cors = properties.getSecurity().getCors();
    this.csrf = properties.getSecurity().getCsrf();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    if (cors.allowsWildcard()) {
      configuration.setAllowedOriginPatterns(List.of(cors.getWildcardOrigin()));
    } else {
      configuration.setAllowedOrigins(cors.allowedOriginsList());
    }
    configuration.setAllowedMethods(cors.allowedMethodsList());
    configuration.setAllowedHeaders(resolveAllowedHeaders());
    configuration.setMaxAge(cors.getMaxAgeSeconds());
    configuration.setAllowCredentials(cors.isAllowCredentials());

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration(cors.getRegistrationPath(), configuration);
    return source;
  }

  private List<String> resolveAllowedHeaders() {
    List<String> headers = new ArrayList<>(cors.allowedHeadersList());
    String csrfHeader = csrf.getHeaderName();
    boolean alreadyPresent =
        headers.stream().anyMatch(header -> header.equalsIgnoreCase(csrfHeader));
    if (!alreadyPresent) {
      headers.add(csrfHeader);
    }
    return headers;
  }
}
