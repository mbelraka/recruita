package com.recruita.api.match.cache.store;

import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.match.cache.MatchEvaluationResultCodec;
import com.recruita.api.match.evaluation.MatchEvaluationResult;
import java.time.Duration;
import java.util.Optional;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "recruita.match.cache", name = "store", havingValue = "redis")
public class RedisMatchResponseCacheStore implements MatchResponseCacheStore {

  private final StringRedisTemplate redisTemplate;
  private final MatchEvaluationResultCodec codec;
  private final String keyPrefix;
  private final Duration ttl;

  public RedisMatchResponseCacheStore(
      StringRedisTemplate redisTemplate,
      MatchEvaluationResultCodec codec,
      RecruitaProperties properties) {
    this.redisTemplate = redisTemplate;
    this.codec = codec;
    var cache = properties.getMatch().getCache();
    this.keyPrefix = cache.getKeyPrefix();
    this.ttl = Duration.ofSeconds(cache.getTtlSeconds());
  }

  @Override
  public Optional<MatchEvaluationResult> get(String cacheKey) {
    String payload = redisTemplate.opsForValue().get(redisKey(cacheKey));
    if (payload == null || payload.isBlank()) {
      return Optional.empty();
    }
    return Optional.of(codec.decode(payload));
  }

  @Override
  public void put(String cacheKey, MatchEvaluationResult value) {
    redisTemplate.opsForValue().set(redisKey(cacheKey), codec.encode(value), ttl);
  }

  private String redisKey(String cacheKey) {
    return keyPrefix + cacheKey;
  }
}
