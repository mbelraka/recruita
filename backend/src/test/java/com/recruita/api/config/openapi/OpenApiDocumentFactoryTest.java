package com.recruita.api.config.openapi;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.recruita.api.config.properties.OpenApiProperties;
import org.junit.jupiter.api.Test;

class OpenApiDocumentFactoryTest {

  private final OpenApiDocumentFactory factory = new OpenApiDocumentFactory();

  @Test
  void buildsDocumentFromProperties() {
    OpenApiProperties properties = new OpenApiProperties();
    properties.getInfo().setTitle("Test API");
    properties.getInfo().setVersion("9.9.9");
    properties.getBearerAuth().setSchemeName("testBearer");

    var document = factory.create(properties);

    assertEquals("Test API", document.getInfo().getTitle());
    assertEquals("9.9.9", document.getInfo().getVersion());
    assertNotNull(document.getComponents().getSecuritySchemes().get("testBearer"));
  }
}
