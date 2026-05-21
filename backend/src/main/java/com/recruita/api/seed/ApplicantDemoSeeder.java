package com.recruita.api.seed;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import com.recruita.api.applicant.service.ApplicantApplicationService;
import com.recruita.api.common.exception.ApplicantConflictException;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("seed")
@ConditionalOnProperty(prefix = "recruita.seed", name = "applicants-demo", havingValue = "true")
public class ApplicantDemoSeeder implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(ApplicantDemoSeeder.class);
  private static final String DEMO_APPLICANTS_RESOURCE = "seed/applicants-demo.json";

  private final ApplicantApplicationService applicantService;
  private final ObjectMapper objectMapper;

  public ApplicantDemoSeeder(
      ApplicantApplicationService applicantService, ObjectMapper objectMapper) {
    this.applicantService = applicantService;
    this.objectMapper = objectMapper;
  }

  @Override
  @Transactional
  public void run(String... args) throws IOException {
    List<SaveApplicantRequestDto> applicants = loadDemoApplicants();
    int inserted = 0;
    int skipped = 0;

    for (SaveApplicantRequestDto applicant : applicants) {
      try {
        applicantService.create(applicant);
        inserted++;
      } catch (ApplicantConflictException ex) {
        skipped++;
      }
    }

    log.info(
        "Applicant demo seed complete: inserted={}, skipped={}, total={}",
        inserted,
        skipped,
        applicants.size());
  }

  private List<SaveApplicantRequestDto> loadDemoApplicants() throws IOException {
    ClassPathResource resource = new ClassPathResource(DEMO_APPLICANTS_RESOURCE);
    try (InputStream input = resource.getInputStream()) {
      return objectMapper.readValue(input, new TypeReference<>() {});
    }
  }
}
