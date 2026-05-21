package com.recruita.api.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "applicants")
public class ApplicantEntity {

  @Id
  @Column(length = 64, nullable = false)
  private String id;

  @Column(length = 512)
  private String name;

  @Column(length = 512)
  private String email;

  @Column(length = 128)
  private String phone;

  @Column(length = 512)
  private String location;

  @Column(name = "years_of_experience")
  private Double yearsOfExperience;

  @Column(name = "application_status", length = 128)
  private String applicationStatus;

  @Column(name = "current_job_title", length = 512)
  private String currentJobTitle;

  @Column(name = "available_from")
  private LocalDate availableFrom;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "skills", columnDefinition = "jsonb", nullable = false)
  private List<String> skills = new ArrayList<>();

  @Column(columnDefinition = "TEXT")
  private String notes;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  void onCreate() {
    Instant now = Instant.now();
    if (createdAt == null) {
      createdAt = now;
    }
    updatedAt = now;
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = Instant.now();
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public Double getYearsOfExperience() {
    return yearsOfExperience;
  }

  public void setYearsOfExperience(Double yearsOfExperience) {
    this.yearsOfExperience = yearsOfExperience;
  }

  public String getApplicationStatus() {
    return applicationStatus;
  }

  public void setApplicationStatus(String applicationStatus) {
    this.applicationStatus = applicationStatus;
  }

  public String getCurrentJobTitle() {
    return currentJobTitle;
  }

  public void setCurrentJobTitle(String currentJobTitle) {
    this.currentJobTitle = currentJobTitle;
  }

  public LocalDate getAvailableFrom() {
    return availableFrom;
  }

  public void setAvailableFrom(LocalDate availableFrom) {
    this.availableFrom = availableFrom;
  }

  public List<String> getSkills() {
    return List.copyOf(skills);
  }

  public void setSkills(List<String> skills) {
    this.skills = skills == null ? new ArrayList<>() : new ArrayList<>(skills);
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }
}
