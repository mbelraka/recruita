package com.recruita.api.api.controller;

import com.recruita.api.action.model.ParseActionCommandRequest;
import com.recruita.api.action.model.ParseActionResponse;
import com.recruita.api.action.service.ActionParseApplicationService;
import com.recruita.api.generated.api.SmartActionApi;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RestController;

@Tag(
    name = "Smart Action",
    description = "Parse natural-language recruiter commands into structured actions via Groq")
@Validated
@RestController
public class ActionParserController implements SmartActionApi {

  private final ActionParseApplicationService actionParseApplicationService;

  public ActionParserController(ActionParseApplicationService actionParseApplicationService) {
    this.actionParseApplicationService = actionParseApplicationService;
  }

  @Override
  public ResponseEntity<ParseActionResponse> parse(ParseActionCommandRequest request) {
    return ResponseEntity.ok(actionParseApplicationService.parse(request));
  }
}
