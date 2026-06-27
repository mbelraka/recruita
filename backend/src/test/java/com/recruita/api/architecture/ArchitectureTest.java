package com.recruita.api.architecture;

import static com.recruita.api.architecture.ArchitectureRules.APPLICATION_SERVICES_ARE_SPRING_MANAGED;
import static com.recruita.api.architecture.ArchitectureRules.CLASSES;
import static com.recruita.api.architecture.ArchitectureRules.CONTROLLERS_DO_NOT_ACCESS_REPOSITORIES;
import static com.recruita.api.architecture.ArchitectureRules.CONTROLLERS_DO_NOT_CALL_SCORING_OR_DOMAIN;
import static com.recruita.api.architecture.ArchitectureRules.DOMAIN_DOES_NOT_DEPEND_ON_WEB_OR_HTTP_DTOS;
import static com.recruita.api.architecture.ArchitectureRules.REPOSITORIES_ONLY_ACCESSED_BY_APPLICATION_CODE;

import org.junit.jupiter.api.Test;

class ArchitectureTest {

  @Test
  void controllers_do_not_access_repositories_directly() {
    CONTROLLERS_DO_NOT_ACCESS_REPOSITORIES.check(CLASSES);
  }

  @Test
  void controllers_do_not_call_scoring_or_domain_directly() {
    CONTROLLERS_DO_NOT_CALL_SCORING_OR_DOMAIN.check(CLASSES);
  }

  @Test
  void domain_does_not_depend_on_web_or_http_dtos() {
    DOMAIN_DOES_NOT_DEPEND_ON_WEB_OR_HTTP_DTOS.check(CLASSES);
  }

  @Test
  void repositories_are_only_accessed_by_application_and_persistence_code() {
    REPOSITORIES_ONLY_ACCESSED_BY_APPLICATION_CODE.check(CLASSES);
  }

  @Test
  void application_services_are_spring_managed_or_interfaces() {
    APPLICATION_SERVICES_ARE_SPRING_MANAGED.check(CLASSES);
  }
}
