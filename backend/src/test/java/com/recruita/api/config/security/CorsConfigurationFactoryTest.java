package com.recruita.api.config.security;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.recruita.api.config.properties.RecruitaProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

@SpringBootTest
class CorsConfigurationFactoryTest {

  @Autowired private CorsConfigurationSource corsConfigurationSource;
  @Autowired private RecruitaProperties recruitaProperties;

  @Test
  void registersCorsForAllPaths() {
    CorsConfiguration configuration =
        corsConfigurationSource.getCorsConfiguration(
            new org.springframework.mock.web.MockHttpServletRequest("GET", "/api/health"));

    assertNotNull(configuration);
    assertTrue(configuration.getAllowedMethods().contains("GET"));
    assertTrue(
        configuration
            .getAllowedHeaders()
            .contains(recruitaProperties.getSecurity().getCsrf().getHeaderName()));
  }
}
