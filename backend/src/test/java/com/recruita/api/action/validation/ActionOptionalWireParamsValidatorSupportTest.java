package com.recruita.api.action.validation;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruita.api.action.model.ActionParamKey;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ActionOptionalWireParamsValidatorSupportTest {

  @Autowired private ObjectMapper objectMapper;

  @Autowired private FilterParamsValidator filterParamsValidator;

  @Test
  void validateRejectsNonObjectParams() {
    var result =
        ActionOptionalWireParamsValidatorSupport.validate(
            null,
            "params must be object",
            ActionParamKey.FORMAT,
            value -> true,
            "invalid format",
            filterParamsValidator);

    assertThat(result.isValid()).isFalse();
    assertThat(result.errors()).containsExactly("params must be object");
  }

  @Test
  void validateRejectsMissingOrInvalidWireValue() throws Exception {
    assertThat(
            ActionOptionalWireParamsValidatorSupport.validate(
                    objectMapper.readTree("{}"),
                    "params must be object",
                    ActionParamKey.FORMAT,
                    value -> true,
                    "invalid format",
                    filterParamsValidator)
                .isValid())
        .isFalse();

    assertThat(
            ActionOptionalWireParamsValidatorSupport.validate(
                    objectMapper.readTree("{\"format\":1}"),
                    "params must be object",
                    ActionParamKey.FORMAT,
                    value -> true,
                    "invalid format",
                    filterParamsValidator)
                .isValid())
        .isFalse();

    assertThat(
            ActionOptionalWireParamsValidatorSupport.validate(
                    objectMapper.readTree("{\"format\":\"xml\"}"),
                    "params must be object",
                    ActionParamKey.FORMAT,
                    value -> false,
                    "invalid format",
                    filterParamsValidator)
                .isValid())
        .isFalse();
  }

  @Test
  void validateAcceptsWireValueAndOptionalFilters() throws Exception {
    var params = objectMapper.readTree("{\"format\":\"csv\",\"filters\":{\"skills\":[\"Java\"]}}");

    var result =
        ActionOptionalWireParamsValidatorSupport.validate(
            params,
            "params must be object",
            ActionParamKey.FORMAT,
            "csv"::equals,
            "invalid format",
            filterParamsValidator);

    assertThat(result.isValid()).isTrue();
    assertThat(result.value().orElseThrow())
        .containsEntry(ActionParamKey.FORMAT, "csv")
        .containsEntry(ActionParamKey.FILTERS, Map.of("skills", List.of("Java")));
  }
}
