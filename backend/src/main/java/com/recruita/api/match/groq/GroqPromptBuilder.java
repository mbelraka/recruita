package com.recruita.api.match.groq;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruita.api.common.text.PromptTextSupport;
import com.recruita.api.config.properties.MatchProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.match.domain.MatchCandidate;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class GroqPromptBuilder {

  private final MatchProperties.GroqProperties groq;
  private final ObjectMapper objectMapper;
  private final String serializationFailedMessage;

  public GroqPromptBuilder(RecruitaProperties properties, ObjectMapper objectMapper) {
    this.groq = properties.getMatch().getGroq();
    this.objectMapper = objectMapper;
    this.serializationFailedMessage =
        properties.getOperational().getStrategy().getGroqPromptSerializationFailed();
  }

  public String buildUserPrompt(String jobDescription, List<MatchCandidate> candidates) {
    MatchProperties.GroqProperties.PromptProperties prompts = groq.getPrompts();
    String lineJoiner = prompts.getUserLineJoiner();
    StringBuilder prompt = PromptTextSupport.newBuffer(1024);

    for (String line : prompts.getUserLines()) {
      appendJoinedLine(prompt, line, lineJoiner);
    }
    appendJoinedLine(
        prompt, prompts.getJobDescriptionLinePrefix() + jobDescription.trim(), lineJoiner);
    try {
      appendJoinedLine(
          prompt,
          prompts.getCandidatesJsonLinePrefix()
              + objectMapper.writeValueAsString(toPromptCandidates(candidates)),
          lineJoiner);
    } catch (JsonProcessingException ex) {
      throw new IllegalStateException(serializationFailedMessage, ex);
    }

    return prompt.toString();
  }

  public String systemPrompt() {
    return groq.getPrompts().getSystem();
  }

  private static void appendJoinedLine(StringBuilder prompt, String line, String joiner) {
    if (!prompt.isEmpty()) {
      prompt.append(joiner);
    }
    prompt.append(line);
  }

  private static List<PromptCandidate> toPromptCandidates(List<MatchCandidate> candidates) {
    return candidates.stream()
        .map(
            candidate ->
                new PromptCandidate(
                    candidate.correlationId(),
                    candidate.skills(),
                    candidate.yearsOfExperience(),
                    candidate.currentJobTitle()))
        .toList();
  }

  private record PromptCandidate(
      String id, List<String> skills, Double yearsOfExperience, String currentJobTitle) {}
}
