package com.recruita.api.applicant.roster;

import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.match.cache.support.MatchCacheRedisUriSupport;
import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import jakarta.annotation.PreDestroy;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.data.redis.RedisProperties;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "recruita.persistence", name = "enabled", havingValue = "true")
public class RedisRosterVersionService implements RosterVersionService {

  private final RedisClient client;
  private final StatefulRedisConnection<String, String> connection;
  private final String versionKey;

  public RedisRosterVersionService(RedisProperties redisProperties, RecruitaProperties properties) {
    this.client = RedisClient.create(MatchCacheRedisUriSupport.buildUri(redisProperties));
    this.connection = client.connect();
    this.versionKey = properties.getApplicant().getRoster().getRedisVersionKey();
  }

  @Override
  public long current() {
    String raw = connection.sync().get(versionKey);
    if (raw == null || raw.isBlank()) {
      return 0L;
    }
    try {
      return Long.parseLong(raw.trim());
    } catch (NumberFormatException exception) {
      return 0L;
    }
  }

  @Override
  public long bump() {
    return connection.sync().incr(versionKey);
  }

  @PreDestroy
  void shutdown() {
    connection.close();
    client.shutdown();
  }
}
