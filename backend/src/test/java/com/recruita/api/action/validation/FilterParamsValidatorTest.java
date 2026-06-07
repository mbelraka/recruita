package com.recruita.api.action.validation;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class FilterParamsValidatorTest {

  @Autowired private FilterParamsValidator validator;

  @Autowired private ObjectMapper objectMapper;

  @Test
  void acceptsEmptyFilterObject() throws Exception {
    assertThat(validator.validate(objectMapper.readTree("{}")).isValid()).isTrue();
  }

  @Test
  void acceptsOptionalFields() throws Exception {
    var result =
        validator.validate(
            objectMapper.readTree(
                """
                {"skills":["React"],"minExperience":2,"maxExperience":10,"searchTerm":"senior","location":"Berlin"}
                """));
    assertThat(result.isValid()).isTrue();
    assertThat(result.value()).isPresent();
  }

  @Test
  void rejectsNonObjectParams() {
    assertThat(validator.validate(null).isValid()).isFalse();
  }

  @Test
  void rejectsInvalidSkillsArray() throws Exception {
    var result = validator.validate(objectMapper.readTree("{\"skills\":[1]}"));
    assertThat(result.isValid()).isFalse();
  }

  @Test
  void rejectsTooManySkills() throws Exception {
    var result =
        validator.validate(
            objectMapper.readTree(
                "{\"skills\":[\"s1\",\"s2\",\"s3\",\"s4\",\"s5\",\"s6\",\"s7\",\"s8\",\"s9\",\"s10\",\"s11\",\"s12\",\"s13\",\"s14\",\"s15\",\"s16\",\"s17\",\"s18\",\"s19\",\"s20\",\"s21\"]}"));
    assertThat(result.isValid()).isFalse();
  }

  @Test
  void rejectsInvalidExperienceBounds() throws Exception {
    var result =
        validator.validate(objectMapper.readTree("{\"minExperience\":-1,\"maxExperience\":99}"));
    assertThat(result.isValid()).isFalse();
    assertThat(result.errors()).hasSize(2);
  }

  @Test
  void rejectsInvalidStatusAndSearchTerm() throws Exception {
    var result =
        validator.validate(
            objectMapper.readTree(
                "{\"status\":\"bad\",\"searchTerm\":\"" + "x".repeat(101) + "\"}"));
    assertThat(result.isValid()).isFalse();
    assertThat(result.errors()).hasSize(2);
  }
}
