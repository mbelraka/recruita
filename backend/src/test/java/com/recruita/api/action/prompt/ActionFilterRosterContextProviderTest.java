package com.recruita.api.action.prompt;

import static org.assertj.core.api.Assertions.assertThat;

import com.recruita.api.action.model.FilterRosterContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ActionFilterRosterContextProviderTest {

  @Autowired private ActionFilterRosterContextProvider provider;

  @Test
  void snapshotLoadsRosterLabelsFromSeedWhenPersistenceIsDisabled() {
    FilterRosterContext snapshot = provider.snapshot();

    assertThat(snapshot.countries()).contains("USA", "Canada", "Germany");
    assertThat(snapshot.cities()).contains("San Francisco", "Toronto", "Berlin");
    assertThat(snapshot.cityToCountry()).containsEntry("berlin", "Germany");
    assertThat(snapshot.skills()).contains("Angular", "React", "TypeScript");
  }
}
