package com.recruita.api.config.properties;

public class SeedProperties {

  private boolean applicantsDemo = false;
  private boolean adminProfile = false;

  public boolean isApplicantsDemo() {
    return applicantsDemo;
  }

  public void setApplicantsDemo(boolean applicantsDemo) {
    this.applicantsDemo = applicantsDemo;
  }

  public boolean isAdminProfile() {
    return adminProfile;
  }

  public void setAdminProfile(boolean adminProfile) {
    this.adminProfile = adminProfile;
  }
}
