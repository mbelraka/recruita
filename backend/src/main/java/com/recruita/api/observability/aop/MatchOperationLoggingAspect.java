package com.recruita.api.observability.aop;

import com.recruita.api.api.dto.match.MatchRequestDto;
import com.recruita.api.common.exception.MatchServiceUnavailableException;
import com.recruita.api.common.exception.MatchValidationException;
import com.recruita.api.config.properties.OperationalProperties;
import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.match.evaluation.MatchEvaluationResult;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class MatchOperationLoggingAspect {

  private static final Logger LOG = LoggerFactory.getLogger(MatchOperationLoggingAspect.class);

  private final OperationalProperties.ObservabilityProperties observability;
  private final String matchResponseScoresField;

  public MatchOperationLoggingAspect(RecruitaProperties properties) {
    this.observability = properties.getOperational().getObservability();
    this.matchResponseScoresField =
        properties.getMatch().getGroq().getApiContract().getMatchResponseScoresField();
  }

  @Around(
      "execution(* com.recruita.api.match.service.MatchApplicationService.evaluate(..)) "
          + "&& args(request)")
  public MatchEvaluationResult logMatchEvaluation(
      ProceedingJoinPoint joinPoint, MatchRequestDto request) throws Throwable {
    long started = System.currentTimeMillis();
    int candidateCount = request.candidates() == null ? 0 : request.candidates().size();
    boolean deterministic = request.isDeterministic();
    try {
      MatchEvaluationResult result = (MatchEvaluationResult) joinPoint.proceed();
      LOG.info(
          observability.getMatchEvaluateCompletedTemplate(),
          deterministic,
          candidateCount,
          result.scoreCount(matchResponseScoresField),
          System.currentTimeMillis() - started);
      return result;
    } catch (MatchValidationException | MatchServiceUnavailableException ex) {
      LOG.debug(
          observability.getMatchEvaluateRejectedTemplate(),
          deterministic,
          candidateCount,
          System.currentTimeMillis() - started);
      throw ex;
    } catch (Exception ex) {
      LOG.warn(
          observability.getMatchEvaluateFailedTemplate(),
          deterministic,
          candidateCount,
          System.currentTimeMillis() - started);
      throw ex;
    }
  }
}
