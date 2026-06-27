package com.recruita.api.config.properties;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

public class SecurityProperties {

  @Valid @NotNull private CorsProperties cors = new CorsProperties();
  @Valid @NotNull private CsrfProperties csrf = new CsrfProperties();
  @Valid @NotNull private HstsProperties hsts = new HstsProperties();
  @Valid @NotNull private RateLimitProperties rateLimit = new RateLimitProperties();
  @Valid @NotNull private HeaderProperties headers = new HeaderProperties();
  @Valid @NotNull private HttpProperties http = new HttpProperties();

  public CorsProperties getCors() {
    return cors;
  }

  public void setCors(CorsProperties cors) {
    this.cors = cors;
  }

  public CsrfProperties getCsrf() {
    return csrf;
  }

  public void setCsrf(CsrfProperties csrf) {
    this.csrf = csrf;
  }

  public HstsProperties getHsts() {
    return hsts;
  }

  public void setHsts(HstsProperties hsts) {
    this.hsts = hsts;
  }

  public RateLimitProperties getRateLimit() {
    return rateLimit;
  }

  public void setRateLimit(RateLimitProperties rateLimit) {
    this.rateLimit = rateLimit;
  }

  public HeaderProperties getHeaders() {
    return headers;
  }

  public void setHeaders(HeaderProperties headers) {
    this.headers = headers;
  }

  public HttpProperties getHttp() {
    return http;
  }

  public void setHttp(HttpProperties http) {
    this.http = http;
  }

  public static class HttpProperties {
    private String trustProxy = "0";
    @Positive private int maxJsonBodyBytes = 524_288;
    @NotBlank private String forwardedForHeader = "X-Forwarded-For";
    @NotBlank private String forwardedForClientSeparator = ",";
    @NotBlank private String matchRequestMethod = "POST";
    @Positive private int millisecondsPerSecond = 1000;
    private java.util.List<String> trustProxyTruthyValues = java.util.Arrays.asList("1", "true");

    public boolean isTrustProxy() {
      String normalized = trustProxy == null ? "" : trustProxy.trim().toLowerCase(Locale.ROOT);
      return trustProxyTruthyValues.stream().anyMatch(value -> value.equalsIgnoreCase(normalized));
    }

    public void setTrustProxy(String trustProxy) {
      this.trustProxy = trustProxy;
    }

    public int getMaxJsonBodyBytes() {
      return maxJsonBodyBytes;
    }

    public void setMaxJsonBodyBytes(int maxJsonBodyBytes) {
      this.maxJsonBodyBytes = maxJsonBodyBytes;
    }

    public String getForwardedForHeader() {
      return forwardedForHeader;
    }

    public void setForwardedForHeader(String forwardedForHeader) {
      this.forwardedForHeader = forwardedForHeader;
    }

    public String getForwardedForClientSeparator() {
      return forwardedForClientSeparator;
    }

    public void setForwardedForClientSeparator(String forwardedForClientSeparator) {
      this.forwardedForClientSeparator = forwardedForClientSeparator;
    }

    public String getMatchRequestMethod() {
      return matchRequestMethod;
    }

    public void setMatchRequestMethod(String matchRequestMethod) {
      this.matchRequestMethod = matchRequestMethod;
    }

    public int getMillisecondsPerSecond() {
      return millisecondsPerSecond;
    }

    public void setMillisecondsPerSecond(int millisecondsPerSecond) {
      this.millisecondsPerSecond = millisecondsPerSecond;
    }

    public java.util.List<String> getTrustProxyTruthyValues() {
      return trustProxyTruthyValues;
    }

    public void setTrustProxyTruthyValues(java.util.List<String> trustProxyTruthyValues) {
      this.trustProxyTruthyValues = trustProxyTruthyValues;
    }
  }

  /** Must stay aligned with frontend {@code APP_CONFIG.HTTP} XSRF names. */
  public static class CsrfProperties {
    private boolean enabled = true;
    @NotBlank private String cookieName = "XSRF-TOKEN";
    @NotBlank private String headerName = "X-XSRF-TOKEN";
    @NotBlank private String parameterName = "_csrf";
    private boolean cookieHttpOnly = false;

    public boolean isEnabled() {
      return enabled;
    }

    public void setEnabled(boolean enabled) {
      this.enabled = enabled;
    }

    public String getCookieName() {
      return cookieName;
    }

    public void setCookieName(String cookieName) {
      this.cookieName = cookieName;
    }

    public String getHeaderName() {
      return headerName;
    }

    public void setHeaderName(String headerName) {
      this.headerName = headerName;
    }

    public String getParameterName() {
      return parameterName;
    }

    public void setParameterName(String parameterName) {
      this.parameterName = parameterName;
    }

    public boolean isCookieHttpOnly() {
      return cookieHttpOnly;
    }

    public void setCookieHttpOnly(boolean cookieHttpOnly) {
      this.cookieHttpOnly = cookieHttpOnly;
    }
  }

  public static class CorsProperties {
    private String allowedOrigins = "http://localhost:4200";
    private String allowedMethods = "GET,HEAD,POST,PUT,DELETE,OPTIONS";
    private String allowedHeaders = "Content-Type";
    @Positive private long maxAgeSeconds = 86_400L;
    private boolean allowCredentials = false;
    private String wildcardOrigin = "*";
    @NotBlank private String registrationPath = "/**";

    public List<String> allowedOriginsList() {
      return Arrays.stream(allowedOrigins.split(","))
          .map(String::trim)
          .filter(origin -> !origin.isEmpty())
          .toList();
    }

    public List<String> allowedMethodsList() {
      return Arrays.stream(allowedMethods.split(",")).map(String::trim).toList();
    }

    public List<String> allowedHeadersList() {
      return Arrays.stream(allowedHeaders.split(",")).map(String::trim).toList();
    }

    public boolean allowsWildcard() {
      return allowedOriginsList().contains(wildcardOrigin);
    }

    public String getAllowedOrigins() {
      return allowedOrigins;
    }

    public void setAllowedOrigins(String allowedOrigins) {
      this.allowedOrigins = allowedOrigins;
    }

    public String getAllowedMethods() {
      return allowedMethods;
    }

    public void setAllowedMethods(String allowedMethods) {
      this.allowedMethods = allowedMethods;
    }

    public String getAllowedHeaders() {
      return allowedHeaders;
    }

    public void setAllowedHeaders(String allowedHeaders) {
      this.allowedHeaders = allowedHeaders;
    }

    public long getMaxAgeSeconds() {
      return maxAgeSeconds;
    }

    public void setMaxAgeSeconds(long maxAgeSeconds) {
      this.maxAgeSeconds = maxAgeSeconds;
    }

    public boolean isAllowCredentials() {
      return allowCredentials;
    }

    public void setAllowCredentials(boolean allowCredentials) {
      this.allowCredentials = allowCredentials;
    }

    public String getWildcardOrigin() {
      return wildcardOrigin;
    }

    public void setWildcardOrigin(String wildcardOrigin) {
      this.wildcardOrigin = wildcardOrigin;
    }

    public String getRegistrationPath() {
      return registrationPath;
    }

    public void setRegistrationPath(String registrationPath) {
      this.registrationPath = registrationPath;
    }
  }

  public static class HstsProperties {
    private boolean enabled = false;
    @Positive private long maxAgeSeconds = 31_536_000L;
    private boolean includeSubdomains = true;
    private boolean preload = false;

    public boolean isEnabled() {
      return enabled;
    }

    public void setEnabled(boolean enabled) {
      this.enabled = enabled;
    }

    public long getMaxAgeSeconds() {
      return maxAgeSeconds;
    }

    public void setMaxAgeSeconds(long maxAgeSeconds) {
      this.maxAgeSeconds = maxAgeSeconds;
    }

    public boolean isIncludeSubdomains() {
      return includeSubdomains;
    }

    public void setIncludeSubdomains(boolean includeSubdomains) {
      this.includeSubdomains = includeSubdomains;
    }

    public boolean isPreload() {
      return preload;
    }

    public void setPreload(boolean preload) {
      this.preload = preload;
    }
  }

  public static class RateLimitProperties {
    @Positive private int maxRequests = 100;
    @Positive private int maxRequestsCeiling = 10_000;
    @Positive private int maxDistinctClients = 10_000;
    @Positive private int windowMinutes = 15;
    private String exceededMessage =
        "Too many match requests from this IP, please try again later.";
    @NotBlank private String headerLimit = "RateLimit-Limit";
    @NotBlank private String headerRemaining = "RateLimit-Remaining";
    @NotBlank private String headerReset = "RateLimit-Reset";

    public int resolvedMaxRequests() {
      return Math.min(Math.max(maxRequests, 1), maxRequestsCeiling);
    }

    public long windowMillis() {
      return windowMinutes * 60_000L;
    }

    public int getMaxRequests() {
      return maxRequests;
    }

    public void setMaxRequests(int maxRequests) {
      this.maxRequests = maxRequests;
    }

    public int getMaxRequestsCeiling() {
      return maxRequestsCeiling;
    }

    public void setMaxRequestsCeiling(int maxRequestsCeiling) {
      this.maxRequestsCeiling = maxRequestsCeiling;
    }

    public int resolvedMaxDistinctClients() {
      return Math.min(Math.max(maxDistinctClients, 1), maxRequestsCeiling);
    }

    public int getMaxDistinctClients() {
      return maxDistinctClients;
    }

    public void setMaxDistinctClients(int maxDistinctClients) {
      this.maxDistinctClients = maxDistinctClients;
    }

    public int getWindowMinutes() {
      return windowMinutes;
    }

    public void setWindowMinutes(int windowMinutes) {
      this.windowMinutes = windowMinutes;
    }

    public String getExceededMessage() {
      return exceededMessage;
    }

    public void setExceededMessage(String exceededMessage) {
      this.exceededMessage = exceededMessage;
    }

    public String getHeaderLimit() {
      return headerLimit;
    }

    public void setHeaderLimit(String headerLimit) {
      this.headerLimit = headerLimit;
    }

    public String getHeaderRemaining() {
      return headerRemaining;
    }

    public void setHeaderRemaining(String headerRemaining) {
      this.headerRemaining = headerRemaining;
    }

    public String getHeaderReset() {
      return headerReset;
    }

    public void setHeaderReset(String headerReset) {
      this.headerReset = headerReset;
    }
  }

  public static class HeaderProperties {
    private boolean frameDeny = true;
    private boolean contentTypeOptions = true;
    private boolean contentSecurityPolicyEnabled = true;
    @NotBlank private String contentSecurityPolicy = "default-src 'none'; frame-ancestors 'none'";
    private boolean cacheControlNoStore = true;
    private boolean crossOriginOpenerPolicyEnabled = true;
    @NotBlank private String crossOriginOpenerPolicy = "same-origin";
    private boolean crossOriginResourcePolicyEnabled = true;
    @NotBlank private String crossOriginResourcePolicy = "same-origin";
    private String referrerPolicy = "strict-origin-when-cross-origin";
    private boolean permissionsPolicyEnabled = true;
    private String permissionsPolicy = "camera=(), microphone=(), geolocation=(), payment=()";
    @NotBlank private String permissionsPolicyHeaderName = "Permissions-Policy";

    public boolean isFrameDeny() {
      return frameDeny;
    }

    public void setFrameDeny(boolean frameDeny) {
      this.frameDeny = frameDeny;
    }

    public boolean isContentTypeOptions() {
      return contentTypeOptions;
    }

    public void setContentTypeOptions(boolean contentTypeOptions) {
      this.contentTypeOptions = contentTypeOptions;
    }

    public boolean isContentSecurityPolicyEnabled() {
      return contentSecurityPolicyEnabled;
    }

    public void setContentSecurityPolicyEnabled(boolean contentSecurityPolicyEnabled) {
      this.contentSecurityPolicyEnabled = contentSecurityPolicyEnabled;
    }

    public String getContentSecurityPolicy() {
      return contentSecurityPolicy;
    }

    public void setContentSecurityPolicy(String contentSecurityPolicy) {
      this.contentSecurityPolicy = contentSecurityPolicy;
    }

    public boolean isCacheControlNoStore() {
      return cacheControlNoStore;
    }

    public void setCacheControlNoStore(boolean cacheControlNoStore) {
      this.cacheControlNoStore = cacheControlNoStore;
    }

    public boolean isCrossOriginOpenerPolicyEnabled() {
      return crossOriginOpenerPolicyEnabled;
    }

    public void setCrossOriginOpenerPolicyEnabled(boolean crossOriginOpenerPolicyEnabled) {
      this.crossOriginOpenerPolicyEnabled = crossOriginOpenerPolicyEnabled;
    }

    public String getCrossOriginOpenerPolicy() {
      return crossOriginOpenerPolicy;
    }

    public void setCrossOriginOpenerPolicy(String crossOriginOpenerPolicy) {
      this.crossOriginOpenerPolicy = crossOriginOpenerPolicy;
    }

    public boolean isCrossOriginResourcePolicyEnabled() {
      return crossOriginResourcePolicyEnabled;
    }

    public void setCrossOriginResourcePolicyEnabled(boolean crossOriginResourcePolicyEnabled) {
      this.crossOriginResourcePolicyEnabled = crossOriginResourcePolicyEnabled;
    }

    public String getCrossOriginResourcePolicy() {
      return crossOriginResourcePolicy;
    }

    public void setCrossOriginResourcePolicy(String crossOriginResourcePolicy) {
      this.crossOriginResourcePolicy = crossOriginResourcePolicy;
    }

    public String getReferrerPolicy() {
      return referrerPolicy;
    }

    public void setReferrerPolicy(String referrerPolicy) {
      this.referrerPolicy = referrerPolicy;
    }

    public boolean isPermissionsPolicyEnabled() {
      return permissionsPolicyEnabled;
    }

    public void setPermissionsPolicyEnabled(boolean permissionsPolicyEnabled) {
      this.permissionsPolicyEnabled = permissionsPolicyEnabled;
    }

    public String getPermissionsPolicy() {
      return permissionsPolicy;
    }

    public void setPermissionsPolicy(String permissionsPolicy) {
      this.permissionsPolicy = permissionsPolicy;
    }

    public String getPermissionsPolicyHeaderName() {
      return permissionsPolicyHeaderName;
    }

    public void setPermissionsPolicyHeaderName(String permissionsPolicyHeaderName) {
      this.permissionsPolicyHeaderName = permissionsPolicyHeaderName;
    }
  }
}
