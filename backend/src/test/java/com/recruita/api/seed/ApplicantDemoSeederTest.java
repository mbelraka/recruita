package com.recruita.api.seed;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.recruita.api.api.dto.applicant.ApplicantDto;
import com.recruita.api.applicant.service.ApplicantApplicationService;
import com.recruita.api.common.exception.ApplicantConflictException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ApplicantDemoSeederTest {

  @Mock private ApplicantApplicationService applicantService;

  private ApplicantDemoSeeder seeder;

  @BeforeEach
  void setUp() {
    ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    seeder = new ApplicantDemoSeeder(applicantService, objectMapper);
  }

  @Test
  void insertsMissingDemoApplicants() throws Exception {
    when(applicantService.create(any()))
        .thenReturn(
            new ApplicantDto(
                null, null, null, null, null, null, null, null, null, null, null, null, null));

    seeder.run();

    verify(applicantService, atLeastOnce()).create(any());
  }

  @Test
  void skipsExistingDemoApplicants() throws Exception {
    doThrow(new ApplicantConflictException("exists")).when(applicantService).create(any());

    seeder.run();

    verify(applicantService, atLeastOnce()).create(any());
  }
}
