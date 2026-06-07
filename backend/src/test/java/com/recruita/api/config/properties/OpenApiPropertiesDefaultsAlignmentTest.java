package com.recruita.api.config.properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

/** Guards OpenAPI property defaults against `application.yml` and `springdoc.*` paths. */
class OpenApiPropertiesDefaultsAlignmentTest {

  private static final String[] REQUIRED_TEST_PROPERTIES = {
    "recruita.profile-api.admin-id=admin", "recruita.match.groq.api-key=test-key"
  };

  private final ApplicationContextRunner contextRunner =
      new ApplicationContextRunner()
          .withUserConfiguration(RecruitaPropertiesBindingTestConfig.class);

  @Test
  void openapiDefaultsMatchApplicationYaml() {
    contextRunner
        .withPropertyValues(REQUIRED_TEST_PROPERTIES)
        .run(
            context -> {
              OpenApiProperties openapi =
                  context.getBean(RecruitaProperties.class).getApi().getOpenapi();
              assertEquals("Recruita API", openapi.getInfo().getTitle());
              assertEquals("1.0.0", openapi.getInfo().getVersion());
              assertEquals("Recruita Team", openapi.getContact().getName());
              assertEquals("bearerAuth", openapi.getBearerAuth().getSchemeName());
              assertTrue(openapi.getPermittedPaths().contains("/v3/api-docs"));
              assertTrue(openapi.getPermittedPaths().contains("/swagger-ui.html"));
            });
  }

  @org.springframework.boot.test.context.TestConfiguration
  @org.springframework.boot.context.properties.EnableConfigurationProperties(
      RecruitaProperties.class)
  static class RecruitaPropertiesBindingTestConfig {}
}
