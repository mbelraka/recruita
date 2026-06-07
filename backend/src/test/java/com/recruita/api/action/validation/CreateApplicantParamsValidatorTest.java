package com.recruita.api.action.validation;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class CreateApplicantParamsValidatorTest {

  @Autowired private CreateApplicantParamsValidator validator;

  @Autowired private ObjectMapper objectMapper;

  @Test
  void rejectsNonObjectParams() {
    assertThat(validator.validate(null).isValid()).isFalse();
  }

  @Test
  void rejectsInvalidName() throws Exception {
    var result =
        validator.validate(
            objectMapper.readTree(
                """
                {"name":"A","email":"jane@example.com","skills":["Java"],"yearsOfExperience":3,"currentJobTitle":"Engineer"}
                """));
    assertThat(result.isValid()).isFalse();
    assertThat(result.errors()).anyMatch(error -> error.contains("name"));
  }

  @Test
  void rejectsInvalidEmailFormats() throws Exception {
    assertThat(
            validator
                .validate(
                    objectMapper.readTree(
                        """
                        {"name":"Jane Doe","email":"no-at-sign","skills":["Java"],"yearsOfExperience":3,"currentJobTitle":"Engineer"}
                        """))
                .isValid())
        .isFalse();
    assertThat(
            validator
                .validate(
                    objectMapper.readTree(
                        """
                        {"name":"Jane Doe","email":"a@b","skills":["Java"],"yearsOfExperience":3,"currentJobTitle":"Engineer"}
                        """))
                .isValid())
        .isFalse();
    assertThat(
            validator
                .validate(
                    objectMapper.readTree(
                        """
                        {"name":"Jane Doe","email":"a@.com","skills":["Java"],"yearsOfExperience":3,"currentJobTitle":"Engineer"}
                        """))
                .isValid())
        .isFalse();
  }

  @Test
  void rejectsEmptyOrInvalidSkills() throws Exception {
    assertThat(
            validator
                .validate(
                    objectMapper.readTree(
                        """
                        {"name":"Jane Doe","email":"jane@example.com","skills":[],"yearsOfExperience":3,"currentJobTitle":"Engineer"}
                        """))
                .isValid())
        .isFalse();
    assertThat(
            validator
                .validate(
                    objectMapper.readTree(
                        """
                        {"name":"Jane Doe","email":"jane@example.com","skills":[1],"yearsOfExperience":3,"currentJobTitle":"Engineer"}
                        """))
                .isValid())
        .isFalse();
  }

  @Test
  void rejectsExperienceOutOfRange() throws Exception {
    assertThat(
            validator
                .validate(
                    objectMapper.readTree(
                        """
                        {"name":"Jane Doe","email":"jane@example.com","skills":["Java"],"yearsOfExperience":99,"currentJobTitle":"Engineer"}
                        """))
                .isValid())
        .isFalse();
  }

  @Test
  void rejectsMissingCurrentJobTitle() throws Exception {
    assertThat(
            validator
                .validate(
                    objectMapper.readTree(
                        """
                        {"name":"Jane Doe","email":"jane@example.com","skills":["Java"],"yearsOfExperience":3,"currentJobTitle":"   "}
                        """))
                .isValid())
        .isFalse();
  }

  @Test
  void omitsNonTextualPhone() throws Exception {
    var result =
        validator.validate(
            objectMapper.readTree(
                """
                {"name":"Jane Doe","email":"jane@example.com","phone":123,"skills":["Java"],"yearsOfExperience":3,"currentJobTitle":"Engineer"}
                """));
    assertThat(result.isValid()).isTrue();
    assertThat(result.value().orElseThrow()).doesNotContainKey("phone");
  }
}
