package com.recruita.api.persistence.repository;

import com.recruita.api.persistence.entity.ProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<ProfileEntity, String> {}
