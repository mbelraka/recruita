package com.recruita.api.match.cache.support;

import org.springframework.boot.autoconfigure.data.redis.RedisProperties;

public final class MatchCacheRedisUriSupport {

  private MatchCacheRedisUriSupport() {}

  public static String buildUri(RedisProperties properties) {
    if (properties.getUrl() != null) {
      return properties.getUrl();
    }

    StringBuilder uri = new StringBuilder("redis://");
    if (properties.getPassword() != null) {
      uri.append(properties.getPassword()).append('@');
    }
    uri.append(properties.getHost()).append(':').append(properties.getPort());
    if (properties.getDatabase() != 0) {
      uri.append('/').append(properties.getDatabase());
    }
    return uri.toString();
  }
}
