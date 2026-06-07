package com.recruita.api.action.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class RosterLabelMatcherTest {

  private static final List<String> COUNTRIES = List.of("USA", "Canada", "Germany");
  private static final List<String> SKILLS = List.of("React", "TypeScript", "Node.js");

  @Test
  void matchesRosterLabelsCaseInsensitively() {
    assertThat(RosterLabelMatcher.match("germany", COUNTRIES)).isEqualTo("Germany");
    assertThat(RosterLabelMatcher.match("react", SKILLS)).isEqualTo("React");
  }

  @Test
  void returnsTrimmedTokenWhenNoRosterMatch() {
    assertThat(RosterLabelMatcher.match("United States", COUNTRIES)).isEqualTo("United States");
    assertThat(RosterLabelMatcher.match("reactjs", SKILLS)).isEqualTo("reactjs");
  }

  @Test
  void handlesBlankOrMissingRoster() {
    assertThat(RosterLabelMatcher.match(" US ", List.of())).isEqualTo("US");
    assertThat(RosterLabelMatcher.match(null, COUNTRIES)).isNull();
  }
}
