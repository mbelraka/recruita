package com.recruita.api.config;

import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.recruita.api.config.properties.RecruitaProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class OpenApiDocumentationIntegrationTest {

  @Autowired private MockMvc mockMvc;
  @Autowired private RecruitaProperties properties;

  @Test
  void exposesOpenApiSpec() throws Exception {
    String title = properties.getApi().getOpenapi().getInfo().getTitle();

    mockMvc
        .perform(get("/v3/api-docs"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.openapi").value(startsWith("3.")))
        .andExpect(jsonPath("$.info.title").value(title))
        .andExpect(jsonPath("$.paths['/api/health']").exists())
        .andExpect(jsonPath("$.paths['/api/match']").exists());
  }

  @Test
  void exposesSwaggerUi() throws Exception {
    mockMvc.perform(get("/swagger-ui/index.html")).andExpect(status().isOk());
  }
}
