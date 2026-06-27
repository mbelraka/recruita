package com.recruita.api.architecture;

import static com.tngtech.archunit.core.importer.ImportOption.Predefined.DO_NOT_INCLUDE_TESTS;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.lang.ArchRule;

/** Shared ArchUnit rules — imported by {@link ArchitectureTest}. */
final class ArchitectureRules {

  static final JavaClasses CLASSES =
      new ClassFileImporter()
          .withImportOption(DO_NOT_INCLUDE_TESTS)
          .importPackages("com.recruita.api");

  static final ArchRule CONTROLLERS_DO_NOT_ACCESS_REPOSITORIES =
      noClasses()
          .that()
          .resideInAPackage("..api.controller..")
          .should()
          .dependOnClassesThat()
          .resideInAPackage("..persistence.repository..");

  static final ArchRule CONTROLLERS_DO_NOT_CALL_SCORING_OR_DOMAIN =
      noClasses()
          .that()
          .resideInAPackage("..api.controller..")
          .should()
          .accessClassesThat()
          .resideInAnyPackage("..match.scoring..", "..match.domain..");

  static final ArchRule DOMAIN_DOES_NOT_DEPEND_ON_WEB_OR_HTTP_DTOS =
      noClasses()
          .that()
          .resideInAPackage("..match.domain..")
          .should()
          .dependOnClassesThat()
          .resideInAnyPackage(
              "..api.controller..", "..api.dto..", "..api.advice..", "org.springframework.web..");

  static final ArchRule REPOSITORIES_ONLY_ACCESSED_BY_APPLICATION_CODE =
      noClasses()
          .that()
          .resideOutsideOfPackages(
              "..service..", "..action.prompt..", "..seed..", "..persistence..")
          .should()
          .accessClassesThat()
          .resideInAPackage("..persistence.repository..");

  static final ArchRule APPLICATION_SERVICES_ARE_SPRING_MANAGED =
      classes()
          .that()
          .resideInAPackage("..service..")
          .and()
          .haveSimpleNameEndingWith("Service")
          .should()
          .beAnnotatedWith(org.springframework.stereotype.Service.class)
          .orShould()
          .beInterfaces();

  private ArchitectureRules() {}
}
