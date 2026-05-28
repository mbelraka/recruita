package com.recruita.api.persistence.entity;

import com.recruita.api.common.enums.UiLanguage;
import com.recruita.api.persistence.converter.UiLanguageConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "profiles")
public class ProfileEntity {

  @Id
  @Column(length = 64, nullable = false)
  private String id;

  @Column(name = "privacy_notice_accepted", nullable = false)
  private boolean privacyNoticeAccepted;

  @Convert(converter = UiLanguageConverter.class)
  @Column(name = "last_language", nullable = false, length = 8)
  private UiLanguage lastLanguage = UiLanguage.EN;

  @Column(name = "optional_remote_translation", nullable = false)
  private boolean optionalRemoteTranslation;

  @Column(name = "optional_geocoding", nullable = false)
  private boolean optionalGeocoding;

  @Column(name = "optional_ai_matching", nullable = false)
  private boolean optionalAiMatching;

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

  public boolean isPrivacyNoticeAccepted() {
    return privacyNoticeAccepted;
  }

  public void setPrivacyNoticeAccepted(boolean privacyNoticeAccepted) {
    this.privacyNoticeAccepted = privacyNoticeAccepted;
  }

  public UiLanguage getLastLanguage() {
    return lastLanguage;
  }

  public void setLastLanguage(UiLanguage lastLanguage) {
    this.lastLanguage = lastLanguage;
  }

  public boolean isOptionalRemoteTranslation() {
    return optionalRemoteTranslation;
  }

  public void setOptionalRemoteTranslation(boolean optionalRemoteTranslation) {
    this.optionalRemoteTranslation = optionalRemoteTranslation;
  }

  public boolean isOptionalGeocoding() {
    return optionalGeocoding;
  }

  public void setOptionalGeocoding(boolean optionalGeocoding) {
    this.optionalGeocoding = optionalGeocoding;
  }

  public boolean isOptionalAiMatching() {
    return optionalAiMatching;
  }

  public void setOptionalAiMatching(boolean optionalAiMatching) {
    this.optionalAiMatching = optionalAiMatching;
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
