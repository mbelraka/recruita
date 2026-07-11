package com.recruita.api.persistence.repository;

import com.recruita.api.persistence.entity.ApplicantEntity;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ApplicantRepository extends JpaRepository<ApplicantEntity, String> {

  @Query("select max(a.updatedAt) from ApplicantEntity a")
  Optional<Instant> findMaxUpdatedAt();
}
