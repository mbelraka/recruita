package com.recruita.api.match.cache;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import org.junit.jupiter.api.Test;

class MatchCacheKeyHasherTest {

  @Test
  void producesStableSha256Hex() {
    String first = MatchCacheKeyHasher.sha256Hex("{\"a\":1}");
    String second = MatchCacheKeyHasher.sha256Hex("{\"a\":1}");

    assertEquals(first, second);
    assertEquals(64, first.length());
  }

  @Test
  void differsForDifferentPayloads() {
    assertNotEquals(
        MatchCacheKeyHasher.sha256Hex("{\"a\":1}"), MatchCacheKeyHasher.sha256Hex("{\"a\":2}"));
  }
}
