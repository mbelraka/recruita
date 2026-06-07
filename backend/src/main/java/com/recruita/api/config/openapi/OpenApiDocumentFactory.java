package com.recruita.api.config.openapi;

import com.recruita.api.config.properties.OpenApiProperties;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.stereotype.Component;

/**
 * Builds the springdoc {@link OpenAPI} model from {@link OpenApiProperties} (single
 * responsibility).
 */
@Component
public class OpenApiDocumentFactory {

  public OpenAPI create(OpenApiProperties properties) {
    OpenApiProperties.InfoProperties info = properties.getInfo();
    OpenApiProperties.ContactProperties contact = properties.getContact();
    OpenApiProperties.BearerAuthProperties bearerAuth = properties.getBearerAuth();

    return new OpenAPI()
        .info(
            new Info()
                .title(info.getTitle())
                .description(info.getDescription())
                .version(info.getVersion())
                .contact(new Contact().name(contact.getName()).url(contact.getUrl())))
        .components(
            new Components()
                .addSecuritySchemes(
                    bearerAuth.getSchemeName(),
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description(bearerAuth.getDescription())));
  }
}
