package com.recruita.api.match.groq;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruita.api.common.exception.MatchServiceUnavailableException;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.match.domain.MatchCandidate;
import com.recruita.api.match.domain.MatchRequest;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class GroqMatchEvaluationService {

  private final GroqChatClient groqChatClient;
  private final GroqPromptBuilder promptBuilder;
  private final GroqJsonResponseParser responseParser;
  private final RecruitaProperties properties;

  public GroqMatchEvaluationService(
      GroqChatClient groqChatClient,
      GroqPromptBuilder promptBuilder,
      GroqJsonResponseParser responseParser,
      RecruitaProperties properties) {
    this.groqChatClient = groqChatClient;
    this.promptBuilder = promptBuilder;
    this.responseParser = responseParser;
    this.properties = properties;
  }

  public JsonNode evaluate(MatchRequest request, List<MatchCandidate> normalizedCandidates) {
    var groq = properties.getMatch().getGroq();
    try {
      String raw =
          groqChatClient.complete(
              new GroqChatCompletionRequest(
                  request.resolvedModel(groq.getDefaultModel()),
                  request.temperature(),
                  request.topP(),
                  request.seed(),
                  promptBuilder.systemPrompt(),
                  promptBuilder.buildUserPrompt(request.jobDescription(), normalizedCandidates)));
      return responseParser.parse(raw);
    } catch (MatchServiceUnavailableException ex) {
      throw ex;
    } catch (Exception ex) {
      throw new MatchServiceUnavailableException(
          ex.getMessage(), properties.getRuntime().shouldSuppressErrorDetail(), ex);
    }
  }
}
