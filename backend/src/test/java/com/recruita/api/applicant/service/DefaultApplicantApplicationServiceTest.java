package com.recruita.api.applicant.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.recruita.api.api.dto.applicant.SaveApplicantRequestDto;
import com.recruita.api.applicant.mapper.ApplicantMapper;
import com.recruita.api.common.exception.ApplicantConflictException;
import com.recruita.api.common.exception.ApplicantNotFoundException;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.persistence.entity.ApplicantEntity;
import com.recruita.api.persistence.repository.ApplicantRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DefaultApplicantApplicationServiceTest {

  @Mock private ApplicantRepository repository;

  private DefaultApplicantApplicationService service;

  @BeforeEach
  void setUp() {
    service =
        new DefaultApplicantApplicationService(
            repository, new ApplicantMapper(), new RecruitaProperties());
  }

  @Test
  void listAllReturnsMappedApplicants() {
    ApplicantEntity entity = new ApplicantEntity();
    entity.setId("a-1");
    entity.setName("Alex");
    when(repository.findAll()).thenReturn(List.of(entity));

    var applicants = service.listAll();

    assertEquals(1, applicants.size());
    assertEquals("a-1", applicants.get(0).id());
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
  }

  @Test
  void deleteRemovesExistingApplicant() {
    when(repository.existsById("a-1")).thenReturn(true);

    service.delete("a-1");

    verify(repository).deleteById("a-1");
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
  }
}
