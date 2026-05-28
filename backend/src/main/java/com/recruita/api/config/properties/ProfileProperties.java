package com.recruita.api.config.properties;

import jakarta.validation.constraints.NotBlank;

public class ProfileProperties {

  @NotBlank private String adminId;

  public String getAdminId() {
    return adminId;
  }

  public void setAdminId(String adminId) {
    this.adminId = adminId;
  }
}
