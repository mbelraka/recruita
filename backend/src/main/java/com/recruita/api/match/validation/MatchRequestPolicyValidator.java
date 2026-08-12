package com.recruita.api.match.validation;

import com.recruita.api.api.dto.match.MatchCandidateDto;
import com.recruita.api.api.dto.match.MatchRequestDto;
import com.recruita.api.common.exception.MatchValidationException;
import com.recruita.api.config.properties.MatchProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import org.springframework.stereotype.Component;

@Component
public class MatchRequestPolicyValidator {

  private final MatchProperties.MessageProperties messages;
  private final MatchProperties.RequestLimitProperties limits;
  private final GroqModelPolicyValidator groqModelPolicyValidator;

  public MatchRequestPolicyValidator(
      RecruitaProperties properties, GroqModelPolicyValidator groqModelPolicyValidator) {
    this.messages = properties.getMatch().getMessages();
    this.limits = properties.getMatch().getRequestLimits();
    this.groqModelPolicyValidator = groqModelPolicyValidator;
  }

  public void validate(MatchRequestDto request) {
    if (request.jobDescription() == null || request.jobDescription().isBlank()) {
      throw new MatchValidationException(messages.getJobDescriptionRequired());
    }
    if (request.jobDescription().length() > limits.getJobDescriptionMaxChars()) {
      throw new MatchValidationException(messages.getJobDescriptionTooLong());
    }
    if (request.candidates().size() > limits.getCandidatesMaxCount()) {
      throw new MatchValidationException(messages.getTooManyCandidates());
    }
    groqModelPolicyValidator.validate(request.model());
    for (MatchCandidateDto candidate : request.candidates()) {
      validateCandidate(candidate);
    }
  }

  private void validateCandidate(MatchCandidateDto candidate) {
    if (candidate.id() == null || candidate.id().isBlank()) {
      throw new MatchValidationException(messages.getCandidateIdRequired());
    }
    if (candidate.id().length() > limits.getCandidateScalarMaxChars()) {
      throw new MatchValidationException(messages.getCandidateFieldTooLong());
    }
    String title = candidate.currentJobTitle();
    if (title != null && title.length() > limits.getCandidateScalarMaxChars()) {
      throw new MatchValidationException(messages.getCandidateFieldTooLong());
    }
    Double years = candidate.yearsOfExperience();
    if (years != null && !Double.isFinite(years)) {
      throw new MatchValidationException(messages.getCandidateYoeInvalid());
    }
    if (candidate.skills() != null) {
      if (candidate.skills().size() > limits.getSkillCountMax()) {
        throw new MatchValidationException(messages.getCandidateSkillsInvalid());
      }
      for (String skill : candidate.skills()) {
        if (skill == null || skill.isBlank() || skill.length() > limits.getSkillItemMaxChars()) {
          throw new MatchValidationException(messages.getCandidateSkillsInvalid());
        }
      }
    }
  }
}
