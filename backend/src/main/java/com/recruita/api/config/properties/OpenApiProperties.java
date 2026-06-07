package com.recruita.api.config.properties;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

/**
 * OpenAPI metadata and documentation paths (must stay aligned with `springdoc.*` in
 * application.yml).
 */
public class OpenApiProperties {

  @Valid @NotNull private InfoProperties info = new InfoProperties();
  @Valid @NotNull private ContactProperties contact = new ContactProperties();
  @Valid @NotNull private BearerAuthProperties bearerAuth = new BearerAuthProperties();

  @NotEmpty
  private List<@NotBlank String> permittedPaths =
      new ArrayList<>(
          List.of("/v3/api-docs", "/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**"));

  public InfoProperties getInfo() {
    return info;
  }

  public void setInfo(InfoProperties info) {
    this.info = info;
  }

  public ContactProperties getContact() {
    return contact;
  }

  public void setContact(ContactProperties contact) {
    this.contact = contact;
  }

  public BearerAuthProperties getBearerAuth() {
    return bearerAuth;
  }

  public void setBearerAuth(BearerAuthProperties bearerAuth) {
    this.bearerAuth = bearerAuth;
  }

  public List<String> getPermittedPaths() {
    return permittedPaths;
  }

  public void setPermittedPaths(List<String> permittedPaths) {
    this.permittedPaths = new ArrayList<>(permittedPaths);
  }

  public String[] permittedPathsArray() {
    return permittedPaths.toArray(String[]::new);
  }

  public static class InfoProperties {
    @NotBlank private String title = "Recruita API";

    @NotBlank
    private String description =
        "Applicant management, session profiles, health checks, and consent-gated AI candidate"
            + " matching.";

    @NotBlank private String version = "1.0.0";

    public String getTitle() {
      return title;
    }

    public void setTitle(String title) {
      this.title = title;
    }

    public String getDescription() {
      return description;
    }

    public void setDescription(String description) {
      this.description = description;
    }

    public String getVersion() {
      return version;
    }

    public void setVersion(String version) {
      this.version = version;
    }
  }

  public static class ContactProperties {
    @NotBlank private String name = "Recruita Team";
    @NotBlank private String url = "https://github.com/mbelraka/recruita";

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public String getUrl() {
      return url;
    }

    public void setUrl(String url) {
      this.url = url;
    }
  }

  public static class BearerAuthProperties {
    @NotBlank private String schemeName = "bearerAuth";

    @NotBlank
    private String description =
        "Optional bearer token for future IdP integration. Public routes do not require"
            + " authentication today.";

    public String getSchemeName() {
      return schemeName;
    }

    public void setSchemeName(String schemeName) {
      this.schemeName = schemeName;
    }

    public String getDescription() {
      return description;
    }

    public void setDescription(String description) {
      this.description = description;
    }
  }
}
