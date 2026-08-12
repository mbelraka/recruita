package com.recruita.api.config.properties;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

public class ApplicantProperties {

  @Valid private RosterProperties roster = new RosterProperties();
  @Valid private MessageProperties messages = new MessageProperties();
  @NotBlank private String listSortProperty = "updatedAt";

  public RosterProperties getRoster() {
    return roster;
  }

  public void setRoster(RosterProperties roster) {
    this.roster = roster;
  }

  public MessageProperties getMessages() {
    return messages;
  }

  public void setMessages(MessageProperties messages) {
    this.messages = messages;
  }

  public String getListSortProperty() {
    return listSortProperty;
  }

  public void setListSortProperty(String listSortProperty) {
    this.listSortProperty = listSortProperty;
  }

  public static class RosterProperties {
    @NotBlank private String redisVersionKey = "recruita:roster:version";
    @NotBlank private String versionResponseHeader = "X-Recruita-Roster-Version";
    @NotBlank private String updatedAtResponseHeader = "X-Recruita-Roster-Updated-At";

    public String getRedisVersionKey() {
      return redisVersionKey;
    }

    public void setRedisVersionKey(String redisVersionKey) {
      this.redisVersionKey = redisVersionKey;
    }

    public String getVersionResponseHeader() {
      return versionResponseHeader;
    }

    public void setVersionResponseHeader(String versionResponseHeader) {
      this.versionResponseHeader = versionResponseHeader;
    }

    public String getUpdatedAtResponseHeader() {
      return updatedAtResponseHeader;
    }

    public void setUpdatedAtResponseHeader(String updatedAtResponseHeader) {
      this.updatedAtResponseHeader = updatedAtResponseHeader;
    }
  }

  public static class MessageProperties {
    @NotBlank private String idRequired = "Applicant id is required.";
    @NotBlank private String nameRequired = "Applicant name is required.";
    @NotBlank private String emailRequired = "Applicant email is required.";
    @NotBlank private String phoneRequired = "Applicant phone is required.";
    @NotBlank private String locationRequired = "Applicant location is required.";

    @NotBlank
    private String applicationStatusRequired = "Applicant application status is required.";

    @NotBlank private String currentJobTitleRequired = "Applicant current job title is required.";

    @NotBlank
    private String yearsOfExperienceRequired = "Applicant years of experience is required.";

    @NotBlank private String skillsRequired = "Applicant must include at least one skill.";

    @NotBlank
    private String idMismatch = "Applicant id in the request body must match the path id.";

    @NotBlank private String notFound = "Applicant not found.";
    @NotBlank private String alreadyExists = "An applicant with this id already exists.";

    public String getIdRequired() {
      return idRequired;
    }

    public void setIdRequired(String idRequired) {
      this.idRequired = idRequired;
    }

    public String getNameRequired() {
      return nameRequired;
    }

    public void setNameRequired(String nameRequired) {
      this.nameRequired = nameRequired;
    }

    public String getEmailRequired() {
      return emailRequired;
    }

    public void setEmailRequired(String emailRequired) {
      this.emailRequired = emailRequired;
    }

    public String getPhoneRequired() {
      return phoneRequired;
    }

    public void setPhoneRequired(String phoneRequired) {
      this.phoneRequired = phoneRequired;
    }

    public String getLocationRequired() {
      return locationRequired;
    }

    public void setLocationRequired(String locationRequired) {
      this.locationRequired = locationRequired;
    }

    public String getApplicationStatusRequired() {
      return applicationStatusRequired;
    }

    public void setApplicationStatusRequired(String applicationStatusRequired) {
      this.applicationStatusRequired = applicationStatusRequired;
    }

    public String getCurrentJobTitleRequired() {
      return currentJobTitleRequired;
    }

    public void setCurrentJobTitleRequired(String currentJobTitleRequired) {
      this.currentJobTitleRequired = currentJobTitleRequired;
    }

    public String getYearsOfExperienceRequired() {
      return yearsOfExperienceRequired;
    }

    public void setYearsOfExperienceRequired(String yearsOfExperienceRequired) {
      this.yearsOfExperienceRequired = yearsOfExperienceRequired;
    }

    public String getSkillsRequired() {
      return skillsRequired;
    }

    public void setSkillsRequired(String skillsRequired) {
      this.skillsRequired = skillsRequired;
    }

    public String getIdMismatch() {
      return idMismatch;
    }

    public void setIdMismatch(String idMismatch) {
      this.idMismatch = idMismatch;
    }

    public String getNotFound() {
      return notFound;
    }

    public void setNotFound(String notFound) {
      this.notFound = notFound;
    }

    public String getAlreadyExists() {
      return alreadyExists;
    }

    public void setAlreadyExists(String alreadyExists) {
      this.alreadyExists = alreadyExists;
    }
  }
}
