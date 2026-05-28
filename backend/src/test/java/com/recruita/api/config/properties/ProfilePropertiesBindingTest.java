package com.recruita.api.config.properties;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class ProfilePropertiesBindingTest {

  private final ApplicationContextRunner contextRunner =
      new ApplicationContextRunner()
          .withUserConfiguration(RecruitaPropertiesBindingTestConfig.class);

  @Test
  void bindsProfileApiAdminIdFromRecruitaProfileApiPrefix() {
    contextRunner
        .withPropertyValues(
            "recruita.profile-api.admin-id=admin", "recruita.match.groq.api-key=test-key")
        .run(
            context -> {
              RecruitaProperties properties = context.getBean(RecruitaProperties.class);
              assertEquals("admin", properties.getProfileApi().getAdminId());
            });
  }

  @org.springframework.boot.test.context.TestConfiguration
  @org.springframework.boot.context.properties.EnableConfigurationProperties(
      RecruitaProperties.class)
  static class RecruitaPropertiesBindingTestConfig {}
}
