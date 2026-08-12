package com.recruita.api.applicant.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import com.recruita.api.applicant.mapper.ApplicantMapper;
import com.recruita.api.applicant.roster.RosterMutationCoordinator;
import com.recruita.api.applicant.roster.RosterVersionService;
import com.recruita.api.common.exception.ApplicantConflictException;
import com.recruita.api.common.exception.ApplicantNotFoundException;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.persistence.entity.ApplicantEntity;
import com.recruita.api.persistence.repository.ApplicantRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

@ExtendWith(MockitoExtension.class)
class DefaultApplicantApplicationServiceTest {

  @Mock private ApplicantRepository repository;
  @Mock private RosterVersionService rosterVersionService;
  @Mock private RosterMutationCoordinator rosterMutationCoordinator;

  private final RecruitaProperties properties = new RecruitaProperties();
  private DefaultApplicantApplicationService service;

  @BeforeEach
  void setUp() {
    RosterWatermarkService rosterWatermarkService =
        new RosterWatermarkService(repository, rosterVersionService);
    service =
        new DefaultApplicantApplicationService(
            repository,
            Mappers.getMapper(ApplicantMapper.class),
            rosterWatermarkService,
            rosterMutationCoordinator,
            properties);
  }

  @Test
  void listSummariesReturnsMappedApplicantsWithoutNotes() {
    ApplicantEntity entity = new ApplicantEntity();
    entity.setId("a-1");
    entity.setName("Alex");
    entity.setNotes("secret");
    when(repository.findAll(any(Sort.class))).thenReturn(List.of(entity));

    var applicants = service.listSummaries();

    assertEquals(1, applicants.size());
    assertEquals("a-1", applicants.get(0).id());
    verify(repository)
        .findAll(Sort.by(Sort.Direction.DESC, properties.getApplicant().getListSortProperty()));
  }

  @Test
  void listFullReturnsMappedApplicantsWithNotes() {
    ApplicantEntity entity = new ApplicantEntity();
    entity.setId("a-1");
    entity.setName("Alex");
    entity.setNotes("secret");
    when(repository.findAll(any(Sort.class))).thenReturn(List.of(entity));

    var applicants = service.listFull();

    assertEquals(1, applicants.size());
    assertEquals("secret", applicants.get(0).notes());
  }

  @Test
  void findByIdReturnsMappedApplicant() {
    ApplicantEntity entity = new ApplicantEntity();
    entity.setId("a-1");
    entity.setName("Alex");
    when(repository.findById("a-1")).thenReturn(Optional.of(entity));

    var applicant = service.findById("a-1");

    assertEquals("a-1", applicant.id());
    assertEquals("Alex", applicant.name());
  }

  @Test
  void updateRejectsMismatchedPathId() {
    assertThrows(
        ApplicantConflictException.class,
        () ->
            service.update(
                "a-1",
                new SaveApplicantRequestDto(
                    "other", "Updated", null, null, null, null, null, null, null, List.of(),
                    null)));
    verify(repository, never()).findById(any());
  }

  @Test
  void updatePersistsChanges() {
    ApplicantEntity entity = new ApplicantEntity();
    entity.setId("a-1");
    when(repository.findById("a-1")).thenReturn(Optional.of(entity));
    when(repository.save(entity)).thenReturn(entity);

    var updated =
        service.update(
            "a-1",
            new SaveApplicantRequestDto(
                "a-1", "Updated", null, null, null, null, null, null, null, List.of(), null));

    assertEquals("Updated", updated.name());
    verify(rosterMutationCoordinator).onRosterMutation();
  }

  @Test
  void deleteRemovesExistingApplicant() {
    when(repository.existsById("a-1")).thenReturn(true);

    service.delete("a-1");

    verify(repository).deleteById("a-1");
    verify(rosterMutationCoordinator).onRosterMutation();
  }

  @Test
  void createRejectsDuplicateIds() {
    when(repository.existsById("dup")).thenReturn(true);

    assertThrows(
        ApplicantConflictException.class,
        () ->
            service.create(
                new SaveApplicantRequestDto(
                    "dup", null, null, null, null, null, null, null, null, List.of(), null)));

    verify(repository, never()).save(any());
  }

  @Test
  void updateRequiresExistingApplicant() {
    when(repository.findById("missing")).thenReturn(Optional.empty());

    assertThrows(
        ApplicantNotFoundException.class,
        () ->
            service.update(
                "missing",
                new SaveApplicantRequestDto(
                    "missing", null, null, null, null, null, null, null, null, List.of(), null)));
  }

  @Test
  void deleteRequiresExistingApplicant() {
    when(repository.existsById("missing")).thenReturn(false);

    assertThrows(ApplicantNotFoundException.class, () -> service.delete("missing"));
  }

  @Test
  void createPersistsMappedEntity() {
    when(repository.existsById("new")).thenReturn(false);
    when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

    var created =
        service.create(
            new SaveApplicantRequestDto(
                "new", "Pat", null, null, null, null, null, null, null, List.of("sql"), null));

    assertEquals("new", created.id());
    assertEquals("Pat", created.name());
    assertEquals(List.of("sql"), created.skills());
    verify(rosterMutationCoordinator).onRosterMutation();
  }

  @Test
  void findByIdRequiresExistingApplicant() {
    when(repository.findById("missing")).thenReturn(Optional.empty());

    assertThrows(ApplicantNotFoundException.class, () -> service.findById("missing"));
  }

  @Test
  void listSummariesReturnsCurrentWatermarkWithBody() {
    ApplicantEntity entity = new ApplicantEntity();
    entity.setId("a-1");
    when(rosterVersionService.current()).thenReturn(7L);
    when(repository.findMaxUpdatedAt()).thenReturn(Optional.of(Instant.ofEpochMilli(1000)));
    when(repository.count()).thenReturn(2L);
    when(repository.findAll(any(Sort.class))).thenReturn(List.of(entity));

    var result = service.listSummaries(null);

    assertEquals(7L, result.watermark().version());
    assertEquals(2L, result.watermark().applicantCount());
    assertEquals("\"roster-v7-1000-2\"", result.watermark().etag());
    assertTrue(result.summaries().isPresent());
  }

  @Test
  void listSummariesReturnsEmptyWhenEtagMatches() {
    when(rosterVersionService.current()).thenReturn(7L);
    when(repository.findMaxUpdatedAt()).thenReturn(Optional.of(Instant.ofEpochMilli(1000)));
    when(repository.count()).thenReturn(2L);

    var result = service.listSummaries("\"roster-v7-1000-2\"");

    assertTrue(result.summaries().isEmpty());
    assertEquals("\"roster-v7-1000-2\"", result.watermark().etag());
    verify(repository, never()).findAll(any(Sort.class));
  }

  @Test
  void listSummariesMatchesOneOfSeveralEtags() {
    when(rosterVersionService.current()).thenReturn(7L);
    when(repository.findMaxUpdatedAt()).thenReturn(Optional.of(Instant.ofEpochMilli(1000)));
    when(repository.count()).thenReturn(2L);

    var result = service.listSummaries("\"stale\", \"roster-v7-1000-2\"");

    assertTrue(result.summaries().isEmpty());
    assertEquals("\"roster-v7-1000-2\"", result.watermark().etag());
  }

  @Test
  void listSummariesReturnsRosterWhenEtagDiffers() {
    ApplicantEntity entity = new ApplicantEntity();
    entity.setId("a-1");
    entity.setName("Alex");
    when(rosterVersionService.current()).thenReturn(7L);
    when(repository.findMaxUpdatedAt()).thenReturn(Optional.of(Instant.ofEpochMilli(1000)));
    when(repository.count()).thenReturn(2L);
    when(repository.findAll(any(Sort.class))).thenReturn(List.of(entity));

    var result = service.listSummaries("\"roster-v1-0-0\"");

    assertTrue(result.summaries().isPresent());
    assertEquals(1, result.summaries().get().size());
    assertEquals("\"roster-v7-1000-2\"", result.watermark().etag());
  }

  @Test
  void listSummariesReturnsRosterWhenHeaderMissing() {
    ApplicantEntity entity = new ApplicantEntity();
    entity.setId("a-1");
    when(rosterVersionService.current()).thenReturn(0L);
    when(repository.findMaxUpdatedAt()).thenReturn(Optional.empty());
    when(repository.count()).thenReturn(0L);
    when(repository.findAll(any(Sort.class))).thenReturn(List.of(entity));

    var result = service.listSummaries(null);

    assertTrue(result.summaries().isPresent());
  }

  @Test
  void listSummariesReturnsRosterWhenHeaderBlank() {
    ApplicantEntity entity = new ApplicantEntity();
    entity.setId("a-1");
    when(rosterVersionService.current()).thenReturn(0L);
    when(repository.findMaxUpdatedAt()).thenReturn(Optional.empty());
    when(repository.count()).thenReturn(0L);
    when(repository.findAll(any(Sort.class))).thenReturn(List.of(entity));

    var result = service.listSummaries("   ");

    assertTrue(result.summaries().isPresent());
  }
}
