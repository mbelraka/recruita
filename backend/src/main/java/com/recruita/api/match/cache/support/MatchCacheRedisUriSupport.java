package com.recruita.api.match.cache.support;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.boot.autoconfigure.data.redis.RedisProperties;

public final class MatchCacheRedisUriSupport {

  private MatchCacheRedisUriSupport() {}

  public static String buildUri(RedisProperties properties) {
    if (properties.getUrl() != null) {
      return properties.getUrl();
    }

    StringBuilder uri = new StringBuilder("redis://");
    if (properties.getPassword() != null) {
      uri.append(encodeUserInfo(properties.getPassword())).append('@');
    }
    uri.append(properties.getHost()).append(':').append(properties.getPort());
    if (properties.getDatabase() != 0) {
      uri.append('/').append(properties.getDatabase());
    }
    return uri.toString();
  }

  /** Percent-encodes password characters that break Redis URI authority parsing. */
  private static String encodeUserInfo(String value) {
    return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
  }
}
