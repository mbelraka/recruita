package com.recruita.api.config;

import com.recruita.api.config.openapi.OpenApiDocumentFactory;
import com.recruita.api.config.properties.RecruitaProperties;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  private final RecruitaProperties properties;
  private final OpenApiDocumentFactory documentFactory;

  public OpenApiConfig(RecruitaProperties properties, OpenApiDocumentFactory documentFactory) {
    this.properties = properties;
    this.documentFactory = documentFactory;
  }

  @Bean
  public OpenAPI recruitaOpenAPI() {
    return documentFactory.create(properties.getApi().getOpenapi());
  }
}
