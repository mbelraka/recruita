package com.recruita.api.common.problem;

import java.net.URI;

/** Stable RFC 7807 problem `type` slugs and programmatic `code` values. */
public enum ApiProblemType {
  REQUEST_VALIDATION("request-validation"),
  INVALID_JSON_BODY("invalid-json-body"),
  MATCH_VALIDATION("match-validation"),
  APPLICANT_NOT_FOUND("applicant-not-found"),
  APPLICANT_CONFLICT("applicant-conflict"),
  PROFILE_NOT_FOUND("profile-not-found"),
  PROFILE_CONFLICT("profile-conflict"),
  ROUTE_NOT_FOUND("route-not-found"),
  MATCH_SERVICE_UNAVAILABLE("match-service-unavailable"),
  RATE_LIMIT_EXCEEDED("rate-limit-exceeded"),
  INTERNAL_ERROR("internal-error");

  private final String slug;

  ApiProblemType(String slug) {
    this.slug = slug;
  }

  public String code() {
    return slug;
  }

  public URI typeUri(String typeBaseUri) {
    String base = typeBaseUri.endsWith("/") ? typeBaseUri : typeBaseUri + "/";
    return URI.create(base + slug);
  }
}
