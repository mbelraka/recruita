package com.recruita.api.action.validation;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
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
  void acceptsOptionalFieldsWithoutRewritingThem() throws Exception {
    var result =
        validator.validate(
            objectMapper.readTree(
                """
                {"skills":["React"],"minExperience":2,"maxExperience":10,"searchTerm":"senior","location":"Berlin"}
                """));
    assertThat(result.isValid()).isTrue();
    assertThat(result.value()).isPresent();
    assertThat(result.value().orElseThrow().get("searchTerm")).isEqualTo("senior");
    assertThat(result.value().orElseThrow().get("country")).isEqualTo("Germany");
    assertThat(result.value().orElseThrow()).doesNotContainKey("location");
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
  void rejectsSkillsWhenNotAnArray() throws Exception {
    var result = validator.validate(objectMapper.readTree("{\"skills\":\"React\"}"));
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
  void acceptsExactLlmRosterLabels() throws Exception {
    var result =
        validator.validate(
            objectMapper.readTree(
                "{\"country\":\"USA\",\"skills\":[\"React\"],\"status\":\"shortlisted\"}"));

    assertThat(result.isValid()).isTrue();
    Map<String, Object> value = result.value().orElseThrow();
    assertThat(value.get("country")).isEqualTo("USA");
    assertThat(value.get("skills")).isEqualTo(List.of("React"));
    assertThat(value.get("status")).isEqualTo("shortlisted");
  }

  @Test
  void canonicalizesRosterLabelCasingOnly() throws Exception {
    var result =
        validator.validate(
            objectMapper.readTree("{\"country\":\"germany\",\"skills\":[\"react\"]}"));

    assertThat(result.isValid()).isTrue();
    assertThat(result.value().orElseThrow().get("country")).isEqualTo("Germany");
    assertThat(result.value().orElseThrow().get("skills")).isEqualTo(List.of("React"));
  }

  @Test
  void rejectsCountryAliasFromLlm() throws Exception {
    assertThat(
            validator.validate(objectMapper.readTree("{\"country\":\"United States\"}")).isValid())
        .isFalse();
  }

  @Test
  void rejectsSkillAliasFromLlm() throws Exception {
    var result =
        validator.validate(objectMapper.readTree("{\"country\":\"USA\",\"skills\":[\"reactjs\"]}"));
    assertThat(result.isValid()).isFalse();
    assertThat(result.errors()).anyMatch(error -> error.contains("skill"));
  }

  @Test
  void rejectsStatusAliasFromLlm() throws Exception {
    var result = validator.validate(objectMapper.readTree("{\"status\":\"short-listed\"}"));
    assertThat(result.isValid()).isFalse();
    assertThat(result.errors()).anyMatch(error -> error.contains("status"));
  }

  @Test
  void acceptsEmptySkillsArray() throws Exception {
    assertThat(validator.validate(objectMapper.readTree("{\"skills\":[]}")).isValid()).isTrue();
  }

  @Test
  void rejectsNonWireStatusCasingFromLlm() throws Exception {
    var result = validator.validate(objectMapper.readTree("{\"status\":\"SHORTLISTED\"}"));
    assertThat(result.isValid()).isFalse();
  }

  @Test
  void skipsRosterValidationForBlankCountry() throws Exception {
    assertThat(validator.validate(objectMapper.readTree("{\"country\":\"   \"}")).isValid())
        .isTrue();
  }

  @Test
  void resolvesRosterCityToCountryFromApplicantData() throws Exception {
    var result = validator.validate(objectMapper.readTree("{\"country\":\"Berlin\"}"));

    assertThat(result.isValid()).isTrue();
    assertThat(result.value().orElseThrow().get("country")).isEqualTo("Germany");
  }

  @Test
  void keepsUnknownLocationWhenItDoesNotMatchRosterGeography() throws Exception {
    var result = validator.validate(objectMapper.readTree("{\"location\":\"Paris\"}"));

    assertThat(result.isValid()).isTrue();
    assertThat(result.value().orElseThrow().get("location")).isEqualTo("Paris");
    assertThat(result.value().orElseThrow()).doesNotContainKey("country");
  }

  @Test
  void keepsUnknownCountryAliasInLocationField() throws Exception {
    var result = validator.validate(objectMapper.readTree("{\"location\":\"US\"}"));

    assertThat(result.isValid()).isTrue();
    assertThat(result.value().orElseThrow().get("location")).isEqualTo("US");
    assertThat(result.value().orElseThrow()).doesNotContainKey("country");
  }

  @Test
  void normalizesLegacyLocationCityToCountry() throws Exception {
    var result = validator.validate(objectMapper.readTree("{\"location\":\"Berlin\"}"));

    assertThat(result.isValid()).isTrue();
    assertThat(result.value().orElseThrow().get("country")).isEqualTo("Germany");
    assertThat(result.value().orElseThrow()).doesNotContainKey("location");
  }

  @Test
  void keepsExplicitCountryWhenLocationAlsoPresent() throws Exception {
    var result =
        validator.validate(
            objectMapper.readTree("{\"country\":\"Canada\",\"location\":\"Berlin\"}"));

    assertThat(result.isValid()).isTrue();
    Map<String, Object> value = result.value().orElseThrow();
    assertThat(value.get("country")).isEqualTo("Canada");
    assertThat(value.get("location")).isEqualTo("Berlin");
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
