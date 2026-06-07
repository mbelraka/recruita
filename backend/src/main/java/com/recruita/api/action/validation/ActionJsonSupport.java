package com.recruita.api.action.validation;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class ActionJsonSupport {

  private ActionJsonSupport() {}

  static boolean isObject(JsonNode node) {
    return node != null && node.isObject();
  }

  static boolean isStringArray(JsonNode node) {
    if (node == null || !node.isArray()) {
      return false;
    }
    for (JsonNode item : node) {
      if (!item.isTextual()) {
        return false;
      }
    }
    return true;
  }

  static List<String> toStringList(JsonNode node) {
    List<String> values = new ArrayList<>();
    if (node == null || !node.isArray()) {
      return values;
    }
    node.forEach(item -> values.add(item.asText()));
    return values;
  }

  static Map<String, Object> toStringObjectMap(JsonNode node) {
    Map<String, Object> map = new LinkedHashMap<>();
    if (!isObject(node)) {
      return map;
    }
    node.fields()
        .forEachRemaining(
            entry -> {
              JsonNode value = entry.getValue();
              if (value.isTextual()) {
                map.put(entry.getKey(), value.asText());
              } else if (value.isNumber()) {
                map.put(entry.getKey(), value.numberValue());
              } else if (value.isBoolean()) {
                map.put(entry.getKey(), value.asBoolean());
              } else if (value.isArray() && isStringArray(value)) {
                map.put(entry.getKey(), toStringList(value));
              } else if (isObject(value)) {
                map.put(entry.getKey(), toStringObjectMap(value));
              }
            });
    return map;
  }
}
