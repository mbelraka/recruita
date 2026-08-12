package com.recruita.api.config.properties;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

public class ProfileProperties {

  @NotBlank private String adminId;
  @Valid private MessageProperties messages = new MessageProperties();

  public String getAdminId() {
    return adminId;
  }

  public void setAdminId(String adminId) {
    this.adminId = adminId;
  }

  public MessageProperties getMessages() {
    return messages;
  }

  public void setMessages(MessageProperties messages) {
    this.messages = messages;
  }

  public static class MessageProperties {
    @NotBlank private String idRequired = "Profile id is required.";
    @NotBlank private String lastLanguageRequired = "Last language is required.";
    @NotBlank private String idMismatch = "Profile id in the request body must match the path id.";
    @NotBlank private String notFound = "Profile not found.";
    @NotBlank private String alreadyExists = "A profile with this id already exists.";

    public String getIdRequired() {
      return idRequired;
    }

    public void setIdRequired(String idRequired) {
      this.idRequired = idRequired;
    }

    public String getLastLanguageRequired() {
      return lastLanguageRequired;
    }

    public void setLastLanguageRequired(String lastLanguageRequired) {
      this.lastLanguageRequired = lastLanguageRequired;
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
