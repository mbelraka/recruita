package com.recruita.api.persistence.repository;

import com.recruita.api.persistence.entity.ApplicantEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicantRepository extends JpaRepository<ApplicantEntity, String> {}
