package com.recruita.api.action.validation;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

class ActionJsonSupportTest {

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Test
  void convertsMixedFieldTypes() throws Exception {
    var node =
        objectMapper.readTree(
            """
            {"name":"Jane","count":2,"active":true,"tags":["a"],"nested":{"k":"v"}}
            """);

    var map = ActionJsonSupport.toStringObjectMap(node);

    assertThat(map).containsEntry("name", "Jane");
    assertThat(map).containsEntry("count", 2);
    assertThat(map).containsEntry("active", true);
    assertThat(map.get("tags")).isInstanceOf(java.util.List.class);
    assertThat(map.get("nested")).isInstanceOf(java.util.Map.class);
  }

  @Test
  void detectsStringArrays() throws Exception {
    assertThat(ActionJsonSupport.isStringArray(objectMapper.readTree("[\"a\"]"))).isTrue();
    assertThat(ActionJsonSupport.isStringArray(objectMapper.readTree("[1]"))).isFalse();
    assertThat(ActionJsonSupport.isStringArray(null)).isFalse();
    assertThat(ActionJsonSupport.isStringArray(objectMapper.readTree("\"text\""))).isFalse();
  }

  @Test
  void handlesNullAndNonObjectNodes() throws Exception {
    assertThat(ActionJsonSupport.isObject(null)).isFalse();
    assertThat(ActionJsonSupport.toStringObjectMap(null)).isEmpty();
    assertThat(ActionJsonSupport.toStringList(null)).isEmpty();
    assertThat(ActionJsonSupport.toStringList(objectMapper.readTree("\"text\""))).isEmpty();
  }
}
