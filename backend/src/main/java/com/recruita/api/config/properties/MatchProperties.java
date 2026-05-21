package com.recruita.api.config.properties;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class MatchProperties {

  @Valid @NotNull private GroqProperties groq = new GroqProperties();
  @Valid @NotNull private CacheProperties cache = new CacheProperties();
  @Valid @NotNull private RequestLimitProperties requestLimits = new RequestLimitProperties();
  @Valid @NotNull private MessageProperties messages = new MessageProperties();
  @Valid @NotNull private DeterministicProperties deterministic = new DeterministicProperties();

  public GroqProperties getGroq() {
    return groq;
  }

  public void setGroq(GroqProperties groq) {
    this.groq = groq;
  }

  public CacheProperties getCache() {
    return cache;
  }

  public void setCache(CacheProperties cache) {
    this.cache = cache;
  }

  public RequestLimitProperties getRequestLimits() {
    return requestLimits;
  }

  public void setRequestLimits(RequestLimitProperties requestLimits) {
    this.requestLimits = requestLimits;
  }

  public MessageProperties getMessages() {
    return messages;
  }

  public void setMessages(MessageProperties messages) {
    this.messages = messages;
  }

  public DeterministicProperties getDeterministic() {
    return deterministic;
  }

  public void setDeterministic(DeterministicProperties deterministic) {
    this.deterministic = deterministic;
  }

  public static class CacheProperties {
    private boolean enabled = true;
    @NotBlank private String store = "memory";
    @Positive private long ttlSeconds = 3600;
    @NotBlank private String keyPrefix = "recruita:match:";
    @Valid @NotNull private MatchCacheKeyProperties keyFields = new MatchCacheKeyProperties();
    @NotBlank private String nullCanonicalLiteral = "null";

    public boolean isEnabled() {
      return enabled;
    }

    public void setEnabled(boolean enabled) {
      this.enabled = enabled;
    }

    public String getStore() {
      return store;
    }

    public void setStore(String store) {
      this.store = store;
    }

    public long getTtlSeconds() {
      return ttlSeconds;
    }

    public void setTtlSeconds(long ttlSeconds) {
      this.ttlSeconds = ttlSeconds;
    }

    public String getKeyPrefix() {
      return keyPrefix;
    }

    public void setKeyPrefix(String keyPrefix) {
      this.keyPrefix = keyPrefix;
    }

    public MatchCacheKeyProperties getKeyFields() {
      return keyFields;
    }

    public void setKeyFields(MatchCacheKeyProperties keyFields) {
      this.keyFields = keyFields;
    }

    public String getNullCanonicalLiteral() {
      return nullCanonicalLiteral;
    }

    public void setNullCanonicalLiteral(String nullCanonicalLiteral) {
      this.nullCanonicalLiteral = nullCanonicalLiteral;
    }
  }

  public static class GroqProperties {
    private boolean requireApiKeyAtStartup = true;
    @NotBlank private String apiKey = "";
    @NotBlank private String baseUrl = "https://api.groq.com/openai/v1";
    @NotBlank private String chatCompletionsPath = "/chat/completions";
    @NotBlank private String defaultModel = "llama-3.3-70b-versatile";
    private double defaultTemperature = 0;
    private double defaultTopP = 1;
    private int defaultSeed = 42;
    @NotBlank private String responseFormatType = "json_object";
    @NotBlank private String emptyJsonObjectLiteral = "{}";
    @NotBlank private String modelPattern = "^[a-zA-Z0-9._-]{1,96}$";
    @Valid @NotNull private GroqApiContractProperties apiContract = new GroqApiContractProperties();
    @Valid @NotNull private PromptProperties prompts = new PromptProperties();

    public boolean isRequireApiKeyAtStartup() {
      return requireApiKeyAtStartup;
    }

    public void setRequireApiKeyAtStartup(boolean requireApiKeyAtStartup) {
      this.requireApiKeyAtStartup = requireApiKeyAtStartup;
    }

    public String getApiKey() {
      return apiKey;
    }

    public void setApiKey(String apiKey) {
      this.apiKey = apiKey;
    }

    public String getBaseUrl() {
      return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
      this.baseUrl = baseUrl;
    }

    public String getChatCompletionsPath() {
      return chatCompletionsPath;
    }

    public void setChatCompletionsPath(String chatCompletionsPath) {
      this.chatCompletionsPath = chatCompletionsPath;
    }

    public String getDefaultModel() {
      return defaultModel;
    }

    public void setDefaultModel(String defaultModel) {
      this.defaultModel = defaultModel;
    }

    public double getDefaultTemperature() {
      return defaultTemperature;
    }

    public void setDefaultTemperature(double defaultTemperature) {
      this.defaultTemperature = defaultTemperature;
    }

    public double getDefaultTopP() {
      return defaultTopP;
    }

    public void setDefaultTopP(double defaultTopP) {
      this.defaultTopP = defaultTopP;
    }

    public int getDefaultSeed() {
      return defaultSeed;
    }

    public void setDefaultSeed(int defaultSeed) {
      this.defaultSeed = defaultSeed;
    }

    public String getResponseFormatType() {
      return responseFormatType;
    }

    public void setResponseFormatType(String responseFormatType) {
      this.responseFormatType = responseFormatType;
    }

    public String getEmptyJsonObjectLiteral() {
      return emptyJsonObjectLiteral;
    }

    public void setEmptyJsonObjectLiteral(String emptyJsonObjectLiteral) {
      this.emptyJsonObjectLiteral = emptyJsonObjectLiteral;
    }

    public String getModelPattern() {
      return modelPattern;
    }

    public void setModelPattern(String modelPattern) {
      this.modelPattern = modelPattern;
    }

    public GroqApiContractProperties getApiContract() {
      return apiContract;
    }

    public void setApiContract(GroqApiContractProperties apiContract) {
      this.apiContract = apiContract;
    }

    public PromptProperties getPrompts() {
      return prompts;
    }

    public void setPrompts(PromptProperties prompts) {
      this.prompts = prompts;
    }

    public static class PromptProperties {
      @NotBlank
      private String system = "You are an HR matching expert. Always respond with valid JSON only.";

      @NotNull private String userLineJoiner = "\n\n";
      @NotBlank private String jobDescriptionLinePrefix = "Job description: ";
      @NotBlank private String candidatesJsonLinePrefix = "Candidates: ";
      @NotNull private java.util.List<@NotBlank String> userLines = java.util.List.of();

      public String getSystem() {
        return system;
      }

      public void setSystem(String system) {
        this.system = system;
      }

      public String getUserLineJoiner() {
        return userLineJoiner;
      }

      public void setUserLineJoiner(String userLineJoiner) {
        this.userLineJoiner = userLineJoiner;
      }

      public String getJobDescriptionLinePrefix() {
        return jobDescriptionLinePrefix;
      }

      public void setJobDescriptionLinePrefix(String jobDescriptionLinePrefix) {
        this.jobDescriptionLinePrefix = jobDescriptionLinePrefix;
      }

      public String getCandidatesJsonLinePrefix() {
        return candidatesJsonLinePrefix;
      }

      public void setCandidatesJsonLinePrefix(String candidatesJsonLinePrefix) {
        this.candidatesJsonLinePrefix = candidatesJsonLinePrefix;
      }

      public java.util.List<String> getUserLines() {
        return userLines;
      }

      public void setUserLines(java.util.List<String> userLines) {
        this.userLines = userLines;
      }
    }
  }

  public static class RequestLimitProperties {
    @Positive private int jobDescriptionMaxChars = 24_576;
    @Positive private int candidatesMaxCount = 250;
    @Positive private int candidateScalarMaxChars = 4096;
    @Positive private int skillCountMax = 120;
    @Positive private int skillItemMaxChars = 256;

    public int getJobDescriptionMaxChars() {
      return jobDescriptionMaxChars;
    }

    public void setJobDescriptionMaxChars(int jobDescriptionMaxChars) {
      this.jobDescriptionMaxChars = jobDescriptionMaxChars;
    }

    public int getCandidatesMaxCount() {
      return candidatesMaxCount;
    }

    public void setCandidatesMaxCount(int candidatesMaxCount) {
      this.candidatesMaxCount = candidatesMaxCount;
    }

    public int getCandidateScalarMaxChars() {
      return candidateScalarMaxChars;
    }

    public void setCandidateScalarMaxChars(int candidateScalarMaxChars) {
      this.candidateScalarMaxChars = candidateScalarMaxChars;
    }

    public int getSkillCountMax() {
      return skillCountMax;
    }

    public void setSkillCountMax(int skillCountMax) {
      this.skillCountMax = skillCountMax;
    }

    public int getSkillItemMaxChars() {
      return skillItemMaxChars;
    }

    public void setSkillItemMaxChars(int skillItemMaxChars) {
      this.skillItemMaxChars = skillItemMaxChars;
    }
  }

  public static class MessageProperties {
    @NotBlank private String jobDescriptionRequired = "jobDescription is required.";

    @NotBlank
    private String jobDescriptionTooLong = "jobDescription exceeds maximum allowed length.";

    @NotBlank private String candidatesMustBeArray = "candidates must be an array.";
    @NotBlank private String tooManyCandidates = "Too many candidates in one request.";
    @NotBlank private String candidateNotObject = "Each candidate must be a JSON object.";

    @NotBlank
    private String candidateIdRequired =
        "Each candidate must include a non-empty string id (correlation id).";

    @NotBlank private String candidateFieldTooLong = "Candidate field exceeds maximum length.";

    @NotBlank
    private String candidateYoeInvalid = "Candidate yearsOfExperience must be a finite number.";

    @NotBlank
    private String candidateSkillsInvalid = "Candidate skills must be an array of strings.";

    @NotBlank private String modelInvalid = "Model parameter format is invalid.";

    @NotBlank
    private String groqUnavailable =
        "Matching service is temporarily unavailable. Please try again later.";

    @NotBlank private String invalidJsonBody = "Request body must be valid JSON.";
    @NotBlank private String notFound = "Not found.";

    @NotBlank
    private String internalError = "The server encountered an error. Please try again later.";

    @NotBlank private String groqFailed = "Groq request failed";

    public String getJobDescriptionRequired() {
      return jobDescriptionRequired;
    }

    public void setJobDescriptionRequired(String jobDescriptionRequired) {
      this.jobDescriptionRequired = jobDescriptionRequired;
    }

    public String getJobDescriptionTooLong() {
      return jobDescriptionTooLong;
    }

    public void setJobDescriptionTooLong(String jobDescriptionTooLong) {
      this.jobDescriptionTooLong = jobDescriptionTooLong;
    }

    public String getCandidatesMustBeArray() {
      return candidatesMustBeArray;
    }

    public void setCandidatesMustBeArray(String candidatesMustBeArray) {
      this.candidatesMustBeArray = candidatesMustBeArray;
    }

    public String getTooManyCandidates() {
      return tooManyCandidates;
    }

    public void setTooManyCandidates(String tooManyCandidates) {
      this.tooManyCandidates = tooManyCandidates;
    }

    public String getCandidateNotObject() {
      return candidateNotObject;
    }

    public void setCandidateNotObject(String candidateNotObject) {
      this.candidateNotObject = candidateNotObject;
    }

    public String getCandidateIdRequired() {
      return candidateIdRequired;
    }

    public void setCandidateIdRequired(String candidateIdRequired) {
      this.candidateIdRequired = candidateIdRequired;
    }

    public String getCandidateFieldTooLong() {
      return candidateFieldTooLong;
    }

    public void setCandidateFieldTooLong(String candidateFieldTooLong) {
      this.candidateFieldTooLong = candidateFieldTooLong;
    }

    public String getCandidateYoeInvalid() {
      return candidateYoeInvalid;
    }

    public void setCandidateYoeInvalid(String candidateYoeInvalid) {
      this.candidateYoeInvalid = candidateYoeInvalid;
    }

    public String getCandidateSkillsInvalid() {
      return candidateSkillsInvalid;
    }

    public void setCandidateSkillsInvalid(String candidateSkillsInvalid) {
      this.candidateSkillsInvalid = candidateSkillsInvalid;
    }

    public String getModelInvalid() {
      return modelInvalid;
    }

    public void setModelInvalid(String modelInvalid) {
      this.modelInvalid = modelInvalid;
    }

    public String getGroqUnavailable() {
      return groqUnavailable;
    }

    public void setGroqUnavailable(String groqUnavailable) {
      this.groqUnavailable = groqUnavailable;
    }

    public String getInvalidJsonBody() {
      return invalidJsonBody;
    }

    public void setInvalidJsonBody(String invalidJsonBody) {
      this.invalidJsonBody = invalidJsonBody;
    }

    public String getNotFound() {
      return notFound;
    }

    public void setNotFound(String notFound) {
      this.notFound = notFound;
    }

    public String getInternalError() {
      return internalError;
    }

    public void setInternalError(String internalError) {
      this.internalError = internalError;
    }

    public String getGroqFailed() {
      return groqFailed;
    }

    public void setGroqFailed(String groqFailed) {
      this.groqFailed = groqFailed;
    }
  }

  public static class DeterministicProperties {
    @Valid @NotNull private ScoreRangeProperties scoreRange = new ScoreRangeProperties();
    @Valid @NotNull private WeightProperties weights = new WeightProperties();
    @Valid @NotNull private TextProperties text = new TextProperties();
    @Valid @NotNull private ExperienceProperties experience = new ExperienceProperties();

    @Valid @NotNull
    private RecommendationProperties recommendation = new RecommendationProperties();

    @Valid @NotNull private OutputProperties output = new OutputProperties();

    public ScoreRangeProperties getScoreRange() {
      return scoreRange;
    }

    public void setScoreRange(ScoreRangeProperties scoreRange) {
      this.scoreRange = scoreRange;
    }

    public WeightProperties getWeights() {
      return weights;
    }

    public void setWeights(WeightProperties weights) {
      this.weights = weights;
    }

    public TextProperties getText() {
      return text;
    }

    public void setText(TextProperties text) {
      this.text = text;
    }

    public ExperienceProperties getExperience() {
      return experience;
    }

    public void setExperience(ExperienceProperties experience) {
      this.experience = experience;
    }

    public RecommendationProperties getRecommendation() {
      return recommendation;
    }

    public void setRecommendation(RecommendationProperties recommendation) {
      this.recommendation = recommendation;
    }

    public OutputProperties getOutput() {
      return output;
    }

    public void setOutput(OutputProperties output) {
      this.output = output;
    }

    public static class ScoreRangeProperties {
      private int min = 0;
      private int max = 100;

      public int getMin() {
        return min;
      }

      public void setMin(int min) {
        this.min = min;
      }

      public int getMax() {
        return max;
      }

      public void setMax(int max) {
        this.max = max;
      }
    }

    public static class WeightProperties {
      private int skillMatch = 40;
      private int experience = 30;
      private int titleAlignmentExact = 20;
      private int titleAlignmentPartial = 12;
      private int titleAlignmentLow = 5;
      private int titleAlignmentDefault = 10;
      private int logistics = 10;

      public int getSkillMatch() {
        return skillMatch;
      }

      public void setSkillMatch(int skillMatch) {
        this.skillMatch = skillMatch;
      }

      public int getExperience() {
        return experience;
      }

      public void setExperience(int experience) {
        this.experience = experience;
      }

      public int getTitleAlignmentExact() {
        return titleAlignmentExact;
      }

      public void setTitleAlignmentExact(int titleAlignmentExact) {
        this.titleAlignmentExact = titleAlignmentExact;
      }

      public int getTitleAlignmentPartial() {
        return titleAlignmentPartial;
      }

      public void setTitleAlignmentPartial(int titleAlignmentPartial) {
        this.titleAlignmentPartial = titleAlignmentPartial;
      }

      public int getTitleAlignmentLow() {
        return titleAlignmentLow;
      }

      public void setTitleAlignmentLow(int titleAlignmentLow) {
        this.titleAlignmentLow = titleAlignmentLow;
      }

      public int getTitleAlignmentDefault() {
        return titleAlignmentDefault;
      }

      public void setTitleAlignmentDefault(int titleAlignmentDefault) {
        this.titleAlignmentDefault = titleAlignmentDefault;
      }

      public int getLogistics() {
        return logistics;
      }

      public void setLogistics(int logistics) {
        this.logistics = logistics;
      }
    }

    public static class TextProperties {
      private int tokenMinLength = 2;
      private String splitDelimiter = " ";
      @NotBlank private String minYearsRegex = "(\\d+)\\s*\\+?\\s*years?";
      @NotBlank private String nonAlphanumericRegex = "[^a-z0-9]+";
      @NotBlank private String whitespaceRegex = "\\s+";
      @NotBlank private String combiningMarksRegex = "\\p{M}+";

      public int getTokenMinLength() {
        return tokenMinLength;
      }

      public void setTokenMinLength(int tokenMinLength) {
        this.tokenMinLength = tokenMinLength;
      }

      public String getSplitDelimiter() {
        return splitDelimiter;
      }

      public void setSplitDelimiter(String splitDelimiter) {
        this.splitDelimiter = splitDelimiter;
      }

      public String getMinYearsRegex() {
        return minYearsRegex;
      }

      public void setMinYearsRegex(String minYearsRegex) {
        this.minYearsRegex = minYearsRegex;
      }

      public String getNonAlphanumericRegex() {
        return nonAlphanumericRegex;
      }

      public void setNonAlphanumericRegex(String nonAlphanumericRegex) {
        this.nonAlphanumericRegex = nonAlphanumericRegex;
      }

      public String getWhitespaceRegex() {
        return whitespaceRegex;
      }

      public void setWhitespaceRegex(String whitespaceRegex) {
        this.whitespaceRegex = whitespaceRegex;
      }

      public String getCombiningMarksRegex() {
        return combiningMarksRegex;
      }

      public void setCombiningMarksRegex(String combiningMarksRegex) {
        this.combiningMarksRegex = combiningMarksRegex;
      }
    }

    public static class ExperienceProperties {
      private double minYearsFallback = 0;
      private double candidateYoeMissingFallback = 0;
      private double ratioComparisonCeiling = 1;

      public double getMinYearsFallback() {
        return minYearsFallback;
      }

      public void setMinYearsFallback(double minYearsFallback) {
        this.minYearsFallback = minYearsFallback;
      }

      public double getCandidateYoeMissingFallback() {
        return candidateYoeMissingFallback;
      }

      public void setCandidateYoeMissingFallback(double candidateYoeMissingFallback) {
        this.candidateYoeMissingFallback = candidateYoeMissingFallback;
      }

      public double getRatioComparisonCeiling() {
        return ratioComparisonCeiling;
      }

      public void setRatioComparisonCeiling(double ratioComparisonCeiling) {
        this.ratioComparisonCeiling = ratioComparisonCeiling;
      }
    }

    public static class RecommendationProperties {
      private int maxSkillsList = 5;

      @NotBlank
      private String gapsNone = "Gaps: no critical skill gaps detected from parsed requirements.";

      private int strongThreshold = 85;
      private int moderateThreshold = 65;

      @NotBlank
      private String strongVerdict =
          "Overall assessment: strong fit and should be prioritized for interview.";

      @NotBlank
      private String moderateVerdict =
          "Overall assessment: moderate fit with clear upskilling areas.";

      @NotBlank
      private String limitedVerdict =
          "Overall assessment: limited fit for the current role requirements.";

      @NotBlank private String matchedSkillsPrefix = "Matched skills: ";
      @NotBlank private String roleAlignmentPrefix = "Role alignment: current title is ";
      @NotBlank private String gapsPrefix = "Gaps: missing ";
      @NotNull private String period = ".";
      @NotNull private String inlineSkillsJoiner = ", ";
      @NotNull private String recommendationBlockJoiner = " ";

      @NotBlank
      private String experienceWithRequirementTemplate =
          "Experience: %.1f years reported; role signals %.0f+ years.";

      @NotBlank private String experienceSimpleTemplate = "Experience: %.1f years reported.";

      public int getMaxSkillsList() {
        return maxSkillsList;
      }

      public void setMaxSkillsList(int maxSkillsList) {
        this.maxSkillsList = maxSkillsList;
      }

      public String getGapsNone() {
        return gapsNone;
      }

      public void setGapsNone(String gapsNone) {
        this.gapsNone = gapsNone;
      }

      public int getStrongThreshold() {
        return strongThreshold;
      }

      public void setStrongThreshold(int strongThreshold) {
        this.strongThreshold = strongThreshold;
      }

      public int getModerateThreshold() {
        return moderateThreshold;
      }

      public void setModerateThreshold(int moderateThreshold) {
        this.moderateThreshold = moderateThreshold;
      }

      public String getStrongVerdict() {
        return strongVerdict;
      }

      public void setStrongVerdict(String strongVerdict) {
        this.strongVerdict = strongVerdict;
      }

      public String getModerateVerdict() {
        return moderateVerdict;
      }

      public void setModerateVerdict(String moderateVerdict) {
        this.moderateVerdict = moderateVerdict;
      }

      public String getLimitedVerdict() {
        return limitedVerdict;
      }

      public void setLimitedVerdict(String limitedVerdict) {
        this.limitedVerdict = limitedVerdict;
      }

      public String getMatchedSkillsPrefix() {
        return matchedSkillsPrefix;
      }

      public void setMatchedSkillsPrefix(String matchedSkillsPrefix) {
        this.matchedSkillsPrefix = matchedSkillsPrefix;
      }

      public String getRoleAlignmentPrefix() {
        return roleAlignmentPrefix;
      }

      public void setRoleAlignmentPrefix(String roleAlignmentPrefix) {
        this.roleAlignmentPrefix = roleAlignmentPrefix;
      }

      public String getGapsPrefix() {
        return gapsPrefix;
      }

      public void setGapsPrefix(String gapsPrefix) {
        this.gapsPrefix = gapsPrefix;
      }

      public String getPeriod() {
        return period;
      }

      public void setPeriod(String period) {
        this.period = period;
      }

      public String getInlineSkillsJoiner() {
        return inlineSkillsJoiner;
      }

      public void setInlineSkillsJoiner(String inlineSkillsJoiner) {
        this.inlineSkillsJoiner = inlineSkillsJoiner;
      }

      public String getRecommendationBlockJoiner() {
        return recommendationBlockJoiner;
      }

      public void setRecommendationBlockJoiner(String recommendationBlockJoiner) {
        this.recommendationBlockJoiner = recommendationBlockJoiner;
      }

      public String getExperienceWithRequirementTemplate() {
        return experienceWithRequirementTemplate;
      }

      public void setExperienceWithRequirementTemplate(String experienceWithRequirementTemplate) {
        this.experienceWithRequirementTemplate = experienceWithRequirementTemplate;
      }

      public String getExperienceSimpleTemplate() {
        return experienceSimpleTemplate;
      }

      public void setExperienceSimpleTemplate(String experienceSimpleTemplate) {
        this.experienceSimpleTemplate = experienceSimpleTemplate;
      }
    }

    public static class OutputProperties {
      private String emptyEducation = "";

      public String getEmptyEducation() {
        return emptyEducation;
      }

      public void setEmptyEducation(String emptyEducation) {
        this.emptyEducation = emptyEducation;
      }
    }
  }
}
