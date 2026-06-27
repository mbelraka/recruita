package com.recruita.api.config.properties;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

public class RuntimeProperties {

  private String productionMode = "development";
  private String productionModeName = "production";
  private List<String> envTruthyValues = Arrays.asList("1", "true");
  private String suppressErrorDetail = "";

  public boolean isProduction() {
    return productionModeName.equalsIgnoreCase(productionMode.trim());
  }

  public boolean shouldSuppressErrorDetail() {
    if (suppressErrorDetail != null && !suppressErrorDetail.isBlank()) {
      return isTruthy(suppressErrorDetail);
    }
    return isProduction();
  }

  private boolean isTruthy(String raw) {
    String value = raw.trim().toLowerCase(Locale.ROOT);
    return envTruthyValues.stream().anyMatch(truthy -> truthy.equalsIgnoreCase(value));
  }

  public String getProductionMode() {
    return productionMode;
  }

  public void setProductionMode(String productionMode) {
    this.productionMode = productionMode;
  }

  public String getProductionModeName() {
    return productionModeName;
  }

  public void setProductionModeName(String productionModeName) {
    this.productionModeName = productionModeName;
  }

  public List<String> getEnvTruthyValues() {
    return envTruthyValues;
  }

  public void setEnvTruthyValues(List<String> envTruthyValues) {
    this.envTruthyValues = envTruthyValues;
  }

  public String getSuppressErrorDetail() {
    return suppressErrorDetail;
  }

  public void setSuppressErrorDetail(String suppressErrorDetail) {
    this.suppressErrorDetail = suppressErrorDetail;
  }
}
