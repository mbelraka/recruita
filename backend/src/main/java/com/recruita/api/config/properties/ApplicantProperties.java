package com.recruita.api.config.properties;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

public class ApplicantProperties {

  @Valid private RosterProperties roster = new RosterProperties();

  public RosterProperties getRoster() {
    return roster;
  }

  public void setRoster(RosterProperties roster) {
    this.roster = roster;
  }

  public static class RosterProperties {
    @NotBlank private String redisVersionKey = "recruita:roster:version";
    @NotBlank private String versionResponseHeader = "X-Recruita-Roster-Version";

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
  }
}
