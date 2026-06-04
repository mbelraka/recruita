package com.recruita.api.observability.aop;

import static org.junit.jupiter.api.Assertions.assertThrows;

import com.recruita.api.api.dto.match.MatchCandidateDto;
import com.recruita.api.api.dto.match.MatchRequestDto;
import com.recruita.api.common.exception.MatchValidationException;
import com.recruita.api.match.service.MatchApplicationService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class MatchOperationLoggingAspectTest {

  @Autowired private MatchApplicationService matchApplicationService;

  @Test
  void validationFailuresPropagate() {
    MatchRequestDto request =
        new MatchRequestDto(
            " ",
            List.of(new MatchCandidateDto("a", List.of("java"), 1.0, "Dev")),
            true,
            null,
            null,
            null,
            null);

    assertThrows(MatchValidationException.class, () -> matchApplicationService.evaluate(request));
  }
}
