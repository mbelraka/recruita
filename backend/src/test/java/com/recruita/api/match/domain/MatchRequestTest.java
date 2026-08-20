package com.recruita.api.match.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import org.junit.jupiter.api.Test;

class MatchRequestTest {

  @Test
  void resolvesDefaultOrExplicitModel() {
    MatchRequest missingModel = new MatchRequest("  role  ", List.of(), false, null, 0, 1, 42);
    MatchRequest blankModel = new MatchRequest("role", List.of(), false, "  ", 0, 1, 42);
    MatchRequest explicitModel = new MatchRequest("role", List.of(), false, " custom ", 0, 1, 42);

    assertEquals("role", missingModel.jobDescription());
    String fallbackModel = "default-model";
    assertEquals(fallbackModel, missingModel.resolvedModel(fallbackModel));
    assertEquals(fallbackModel, blankModel.resolvedModel(fallbackModel));
    assertEquals("custom", explicitModel.resolvedModel(fallbackModel));
  }
}
