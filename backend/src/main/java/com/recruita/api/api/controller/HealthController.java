package com.recruita.api.api.controller;

import com.recruita.api.api.dto.HealthResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Health", description = "Operational health checks")
@RestController
@RequestMapping
public class HealthController {

  @Operation(summary = "Liveness probe")
  @GetMapping(path = "#{@apiRoutePaths.healthPath}")
  public HealthResponse health() {
    return new HealthResponse(true);
  }
}
