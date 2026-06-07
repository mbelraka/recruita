package com.recruita.api.action.model;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class RosterLocaleSupportTest {

  @Test
  void normalizesKeysWithRootLocaleFolding() {
    assertThat(RosterLocaleSupport.normalizeKey(" Germany ")).isEqualTo("germany");
    assertThat(RosterLocaleSupport.normalizeKey("Node.js")).isEqualTo("node.js");
  }

  @Test
  void comparesLabelsWithoutLocaleSpecificCasing() {
    assertThat(RosterLocaleSupport.labelsEqual("React", "react")).isTrue();
    assertThat(RosterLocaleSupport.labelsEqual("USA", "usa")).isTrue();
    assertThat(RosterLocaleSupport.labelsEqual("Germany", "United States")).isFalse();
  }
}
