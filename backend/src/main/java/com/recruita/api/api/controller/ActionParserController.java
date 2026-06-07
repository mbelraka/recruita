package com.recruita.api.api.controller;

import com.recruita.api.action.model.ParseActionCommandRequest;
import com.recruita.api.action.model.ParseActionResponse;
import com.recruita.api.action.service.ActionParseApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Tag(
    name = "Smart Action",
    description = "Parse natural-language recruiter commands into structured actions via Groq")
@Validated
@RestController
public class ActionParserController {

  private final ActionParseApplicationService actionParseApplicationService;

  public ActionParserController(ActionParseApplicationService actionParseApplicationService) {
    this.actionParseApplicationService = actionParseApplicationService;
  }

  @Operation(summary = "Parse a natural-language command into a JSON action")
  @PostMapping(path = "#{@apiRoutePaths.actionParsePath}")
  public ParseActionResponse parse(@Valid @RequestBody ParseActionCommandRequest request) {
    return actionParseApplicationService.parse(request);
  }
}
