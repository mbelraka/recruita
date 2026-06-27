package com.recruita.api.action.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.action.model.ActionValidationResult;
import com.recruita.api.action.model.ParseActionCommandRequest;
import com.recruita.api.action.model.ParseActionResponse;
import com.recruita.api.action.parse.LlmJsonPayloadParser;
import com.recruita.api.action.prompt.ActionPromptFactory;
import com.recruita.api.action.validation.ActionValidator;
import com.recruita.api.common.exception.MatchServiceUnavailableException;
import com.recruita.api.config.properties.ActionProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.match.groq.GroqChatClient;
import com.recruita.api.match.groq.GroqChatCompletionRequest;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ActionParseApplicationService {

  private final GroqChatClient groqChatClient;
  private final ActionPromptFactory promptFactory;
  private final LlmJsonPayloadParser llmJsonPayloadParser;
  private final ActionValidator actionValidator;
  private final RecruitaProperties properties;

  public ActionParseApplicationService(
      GroqChatClient groqChatClient,
      ActionPromptFactory promptFactory,
      LlmJsonPayloadParser llmJsonPayloadParser,
      ActionValidator actionValidator,
      RecruitaProperties properties) {
    this.groqChatClient = groqChatClient;
    this.promptFactory = promptFactory;
    this.llmJsonPayloadParser = llmJsonPayloadParser;
    this.actionValidator = actionValidator;
    this.properties = properties;
  }

  public ParseActionResponse parse(ParseActionCommandRequest request) {
    ActionProperties.GroqInvocationProperties groq = properties.getAction().getGroq();
    var matchGroq = properties.getMatch().getGroq();
    String model = groq.getModel();
    String systemPrompt = promptFactory.systemPrompt();
    String userPrompt = promptFactory.userPrompt(request.command(), request.language());

    try {
      String content =
          groqChatClient.complete(
              new GroqChatCompletionRequest(
                  model,
                  groq.getTemperature(),
                  matchGroq.getDefaultTopP(),
                  matchGroq.getDefaultSeed(),
                  systemPrompt,
                  userPrompt));
      String payload = content == null ? matchGroq.getEmptyJsonObjectLiteral() : content;
      JsonNode parsed = llmJsonPayloadParser.parse(payload);
      if (parsed == null) {
        return ParseActionResponse.from(
            ActionValidationResult.invalid(List.of("Failed to parse LLM response as JSON")));
      }
      return ParseActionResponse.from(actionValidator.validate(parsed));
    } catch (MatchServiceUnavailableException ex) {
      throw ex;
    } catch (Exception ex) {
      throw new MatchServiceUnavailableException(
          ex.getMessage(), properties.getRuntime().shouldSuppressErrorDetail(), ex);
    }
  }
}
