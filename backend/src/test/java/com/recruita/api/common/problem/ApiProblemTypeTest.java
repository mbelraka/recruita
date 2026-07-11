package com.recruita.api.common.problem;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class ApiProblemTypeTest {

  @Test
  void buildsTypeUriWithOrWithoutTrailingSlash() {
    assertEquals(
        "https://recruita.dev/problems/internal-error",
        ApiProblemType.INTERNAL_ERROR.typeUri("https://recruita.dev/problems/").toString());
    assertEquals(
        "https://recruita.dev/problems/internal-error",
        ApiProblemType.INTERNAL_ERROR.typeUri("https://recruita.dev/problems").toString());
  }

  @Test
  void exposesStableCodeSlug() {
    assertEquals("rate-limit-exceeded", ApiProblemType.RATE_LIMIT_EXCEEDED.code());
  }
}
