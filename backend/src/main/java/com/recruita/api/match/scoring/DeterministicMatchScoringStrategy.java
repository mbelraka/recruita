package com.recruita.api.match.scoring;

import com.recruita.api.common.math.NumericRanges;
import com.recruita.api.config.properties.MatchProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.match.domain.CandidateProfile;
import com.recruita.api.match.domain.JobRequirements;
import com.recruita.api.match.domain.MatchCandidate;
import com.recruita.api.match.domain.MatchScore;
import jakarta.annotation.PostConstruct;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class DeterministicMatchScoringStrategy implements MatchScoringStrategy {

  private final MatchProperties.DeterministicProperties config;
  private Pattern minYearsPattern;
  private Pattern nonAlphanumericPattern;
  private Pattern whitespacePattern;
  private Pattern combiningMarksPattern;

  public DeterministicMatchScoringStrategy(RecruitaProperties properties) {
    this.config = properties.getMatch().getDeterministic();
  }

  @PostConstruct
  void compilePatterns() {
    MatchProperties.DeterministicProperties.TextProperties text = config.getText();
    this.minYearsPattern = Pattern.compile(text.getMinYearsRegex(), Pattern.CASE_INSENSITIVE);
    this.nonAlphanumericPattern = Pattern.compile(text.getNonAlphanumericRegex());
    this.whitespacePattern = Pattern.compile(text.getWhitespaceRegex());
    this.combiningMarksPattern = Pattern.compile(text.getCombiningMarksRegex());
  }

  @Override
  public boolean supports(boolean deterministic) {
    return deterministic;
  }

  @Override
  public List<MatchScore> score(String jobDescription, List<MatchCandidate> candidates) {
    JobRequirements requirements = buildJobRequirements(jobDescription, candidates);
    return candidates.stream().map(candidate -> scoreCandidate(requirements, candidate)).toList();
  }

  private JobRequirements buildJobRequirements(
      String jobDescription, List<MatchCandidate> candidates) {
    Set<String> jdTokens = tokenize(jobDescription);
    Set<String> skillPool = new HashSet<>();
    for (MatchCandidate candidate : candidates) {
      for (String skill : candidate.skills()) {
        skillPool.add(normalizeText(skill));
      }
    }
    String delimiter = config.getText().getSplitDelimiter();
    List<String> requiredSkills =
        skillPool.stream()
            .filter(skill -> !skill.isBlank())
            .filter(
                skill -> {
                  for (String part : skill.split(delimiter)) {
                    if (!part.isBlank() && !jdTokens.contains(part)) {
                      return false;
                    }
                  }
                  return true;
                })
            .sorted()
            .toList();
    return new JobRequirements(requiredSkills, extractMinYearsExperience(jobDescription));
  }

  private MatchScore scoreCandidate(JobRequirements requirements, MatchCandidate candidate) {
    MatchProperties.DeterministicProperties.WeightProperties weights = config.getWeights();
    MatchProperties.DeterministicProperties.ExperienceProperties exp = config.getExperience();

    List<String> normalizedSkills =
        candidate.skills().stream()
            .map(this::normalizeText)
            .filter(skill -> !skill.isBlank())
            .toList();
    Set<String> skillSet = new HashSet<>(normalizedSkills);
    List<String> matchingSkills =
        requirements.requiredSkills().stream().filter(skillSet::contains).toList();
    List<String> missingSkills =
        requirements.requiredSkills().stream().filter(skill -> !skillSet.contains(skill)).toList();

    double skillMatchScore =
        requirements.requiredSkills().isEmpty()
            ? weights.getSkillMatch()
            : ((double) matchingSkills.size() / requirements.requiredSkills().size())
                * weights.getSkillMatch();

    double years =
        candidate.yearsOfExperience() == null
            ? exp.getCandidateYoeMissingFallback()
            : candidate.yearsOfExperience();
    double experienceScore =
        requirements.minYearsExperience() > 0
            ? Math.min(years / requirements.minYearsExperience(), exp.getRatioComparisonCeiling())
                * weights.getExperience()
            : weights.getExperience();

    double titleAlignmentScore =
        titleAlignmentScore(
            String.join(config.getText().getSplitDelimiter(), requirements.requiredSkills()),
            candidate.currentJobTitle());

    int overall =
        (int)
            Math.round(
                clamp(
                    skillMatchScore
                        + experienceScore
                        + titleAlignmentScore
                        + weights.getLogistics(),
                    config.getScoreRange().getMin(),
                    config.getScoreRange().getMax()));

    String recommendation =
        buildRecommendation(requirements, matchingSkills, missingSkills, years, candidate, overall);

    return new MatchScore(
        candidate.correlationId(),
        overall,
        matchingSkills,
        missingSkills,
        new CandidateProfile(
            candidate.skills(),
            Double.isFinite(years) ? years : exp.getCandidateYoeMissingFallback(),
            candidate.currentJobTitle().isBlank()
                ? List.of()
                : List.of(candidate.currentJobTitle()),
            config.getOutput().getEmptyEducation()),
        recommendation);
  }

  private double titleAlignmentScore(String jdText, String title) {
    String normalizedTitle = normalizeText(title);
    if (normalizedTitle.isBlank() || jdText.isBlank()) {
      return config.getWeights().getTitleAlignmentDefault();
    }
    if (jdText.contains(normalizedTitle) || normalizedTitle.contains(jdText)) {
      return config.getWeights().getTitleAlignmentExact();
    }
    for (String part : tokenize(normalizedTitle)) {
      if (jdText.contains(part)) {
        return config.getWeights().getTitleAlignmentPartial();
      }
    }
    return config.getWeights().getTitleAlignmentLow();
  }

  private String buildRecommendation(
      JobRequirements requirements,
      List<String> matchingSkills,
      List<String> missingSkills,
      double years,
      MatchCandidate candidate,
      int overall) {
    MatchProperties.DeterministicProperties.RecommendationProperties rec =
        config.getRecommendation();
    List<String> parts = new ArrayList<>();

    if (!matchingSkills.isEmpty()) {
      parts.add(
          rec.getMatchedSkillsPrefix()
              + matchingSkills.stream()
                  .limit(rec.getMaxSkillsList())
                  .reduce((a, b) -> a + rec.getInlineSkillsJoiner() + b)
                  .orElse("")
              + rec.getPeriod());
    }
    if (years > config.getExperience().getCandidateYoeMissingFallback()) {
      if (requirements.minYearsExperience() > 0) {
        parts.add(
            String.format(
                Locale.ROOT,
                rec.getExperienceWithRequirementTemplate(),
                years,
                requirements.minYearsExperience()));
      } else {
        parts.add(String.format(Locale.ROOT, rec.getExperienceSimpleTemplate(), years));
      }
    }
    if (!candidate.currentJobTitle().isBlank()) {
      parts.add(rec.getRoleAlignmentPrefix() + candidate.currentJobTitle() + rec.getPeriod());
    }
    if (!missingSkills.isEmpty()) {
      parts.add(
          rec.getGapsPrefix()
              + missingSkills.stream()
                  .limit(rec.getMaxSkillsList())
                  .reduce((a, b) -> a + rec.getInlineSkillsJoiner() + b)
                  .orElse("")
              + rec.getPeriod());
    } else {
      parts.add(rec.getGapsNone());
    }
    if (overall >= rec.getStrongThreshold()) {
      parts.add(rec.getStrongVerdict());
    } else if (overall >= rec.getModerateThreshold()) {
      parts.add(rec.getModerateVerdict());
    } else {
      parts.add(rec.getLimitedVerdict());
    }
    return String.join(rec.getRecommendationBlockJoiner(), parts);
  }

  private double extractMinYearsExperience(String jobDescription) {
    Matcher matcher = minYearsPattern.matcher(jobDescription);
    if (!matcher.find()) {
      return config.getExperience().getMinYearsFallback();
    }
    try {
      return Double.parseDouble(matcher.group(1));
    } catch (NumberFormatException ex) {
      return config.getExperience().getMinYearsFallback();
    }
  }

  private Set<String> tokenize(String text) {
    Set<String> tokens = new HashSet<>();
    for (String token : normalizeText(text).split(config.getText().getSplitDelimiter())) {
      if (token.length() >= config.getText().getTokenMinLength()) {
        tokens.add(token);
      }
    }
    return tokens;
  }

  private String normalizeText(String text) {
    String normalized = Normalizer.normalize(String.valueOf(text), Normalizer.Form.NFD);
    normalized = combiningMarksPattern.matcher(normalized).replaceAll("");
    normalized = normalized.toLowerCase(Locale.ROOT);
    normalized =
        nonAlphanumericPattern.matcher(normalized).replaceAll(config.getText().getSplitDelimiter());
    normalized =
        whitespacePattern
            .matcher(normalized)
            .replaceAll(config.getText().getSplitDelimiter())
            .trim();
    return normalized;
  }

  private static double clamp(double value, double min, double max) {
    return NumericRanges.clamp(value, min, max);
  }
}
