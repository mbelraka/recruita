package com.recruita.api.config.properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

/** Guards against Java field defaults drifting from `application.yml`. */
class RecruitaPropertiesDefaultsAlignmentTest {

  private static final String[] REQUIRED_TEST_PROPERTIES = {
    "recruita.profile-api.admin-id=admin", "recruita.match.groq.api-key=test-key"
  };

  private final ApplicationContextRunner contextRunner =
      new ApplicationContextRunner()
          .withUserConfiguration(RecruitaPropertiesBindingTestConfig.class);

  @Test
  void securityCorsDefaultsMatchApplicationYaml() {
    contextRunner
        .withPropertyValues(REQUIRED_TEST_PROPERTIES)
        .run(
            context -> {
              SecurityProperties.CorsProperties cors =
                  context.getBean(RecruitaProperties.class).getSecurity().getCors();
              assertEquals("http://localhost:4200", cors.getAllowedOrigins().split(",")[0].trim());
              assertEquals("GET,HEAD,POST,PUT,DELETE,OPTIONS", cors.getAllowedMethods());
              assertEquals("Content-Type", cors.getAllowedHeaders());
              assertEquals(86_400L, cors.getMaxAgeSeconds());
              assertFalse(cors.isAllowCredentials());
            });
  }

  @Test
  void securityCsrfDefaultsMatchApplicationYaml() {
    contextRunner
        .withPropertyValues(REQUIRED_TEST_PROPERTIES)
        .run(
            context -> {
              SecurityProperties.CsrfProperties csrf =
                  context.getBean(RecruitaProperties.class).getSecurity().getCsrf();
              assertTrue(csrf.isEnabled());
              assertEquals("XSRF-TOKEN", csrf.getCookieName());
              assertEquals("X-XSRF-TOKEN", csrf.getHeaderName());
              assertEquals("_csrf", csrf.getParameterName());
              assertFalse(csrf.isCookieHttpOnly());
            });
  }

  @Test
  void apiValidationDefaultMessageMatchesApplicationYaml() {
    contextRunner
        .withPropertyValues(REQUIRED_TEST_PROPERTIES)
        .run(
            context -> {
              assertEquals(
                  "Request validation failed.",
                  context
                      .getBean(RecruitaProperties.class)
                      .getApi()
                      .getValidation()
                      .getDefaultMessage());
            });
  }

  @org.springframework.boot.test.context.TestConfiguration
  @org.springframework.boot.context.properties.EnableConfigurationProperties(
      RecruitaProperties.class)
  static class RecruitaPropertiesBindingTestConfig {}
}
