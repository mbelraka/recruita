package com.recruita.api.action.validation;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruita.api.action.model.ActionParamKey;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ActionOptionalFiltersSupportTest {

  @Autowired private ObjectMapper objectMapper;

  @Autowired private FilterParamsValidator filterParamsValidator;

  @Test
  void mergeOptionalFiltersReturnsParamsWhenFiltersMissing() {
    var actionParams = new LinkedHashMap<String, Object>(Map.of("format", "csv"));

    var result =
        ActionOptionalFiltersSupport.mergeOptionalFilters(
            objectMapper.createObjectNode(), actionParams, filterParamsValidator);

    assertThat(result.isValid()).isTrue();
    assertThat(result.value()).contains(actionParams);
  }

  @Test
  void mergeOptionalFiltersMergesValidFilters() throws Exception {
    var params =
        objectMapper.readTree(
            """
            {"filters":{"skills":["Java"]}}
            """);
    var actionParams = new LinkedHashMap<String, Object>(Map.of("format", "csv"));

    var result =
        ActionOptionalFiltersSupport.mergeOptionalFilters(
            params, actionParams, filterParamsValidator);

    assertThat(result.isValid()).isTrue();
    assertThat(result.value().orElseThrow())
        .containsEntry("format", "csv")
        .containsEntry(ActionParamKey.FILTERS, Map.of("skills", List.of("Java")));
  }

  @Test
  void mergeOptionalFiltersReturnsValidationErrors() throws Exception {
    var params = objectMapper.readTree("{\"filters\":{\"skills\":[1]}}");
    var actionParams = new LinkedHashMap<String, Object>();

    var result =
        ActionOptionalFiltersSupport.mergeOptionalFilters(
            params, actionParams, filterParamsValidator);

    assertThat(result.isValid()).isFalse();
    assertThat(result.errors()).isNotEmpty();
  }
}
