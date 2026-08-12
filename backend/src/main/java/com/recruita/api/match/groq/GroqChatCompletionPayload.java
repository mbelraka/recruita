package com.recruita.api.match.groq;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.recruita.api.config.properties.GroqApiContractProperties;
import java.util.List;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
record GroqChatCompletionPayload(
    String model,
    double temperature,
    double topP,
    int seed,
    List<GroqChatMessage> messages,
    GroqResponseFormat responseFormat) {

  static GroqChatCompletionPayload from(
      GroqChatCompletionRequest request,
      String responseFormatType,
      GroqApiContractProperties.MessageRoleProperties messageRoles) {
    return new GroqChatCompletionPayload(
        request.model(),
        request.temperature(),
        request.topP(),
        request.seed(),
        List.of(
            new GroqChatMessage(messageRoles.getSystem(), request.systemPrompt()),
            new GroqChatMessage(messageRoles.getUser(), request.userPrompt())),
        new GroqResponseFormat(responseFormatType));
  }
}
