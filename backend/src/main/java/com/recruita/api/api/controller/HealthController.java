package com.recruita.api.api.controller;

import com.recruita.api.api.dto.HealthResponse;
import com.recruita.api.generated.api.HealthApi;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Health", description = "Operational health checks")
@RestController
public class HealthController implements HealthApi {

  @Override
  public ResponseEntity<HealthResponse> health() {
    return ResponseEntity.ok(new HealthResponse(true));
  }
}
