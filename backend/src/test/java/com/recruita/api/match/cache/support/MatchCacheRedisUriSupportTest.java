package com.recruita.api.match.cache.support;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.data.redis.RedisProperties;

class MatchCacheRedisUriSupportTest {

  @Test
  void buildsUriFromHostAndPort() {
    RedisProperties properties = new RedisProperties();
    properties.setHost("redis.local");
    properties.setPort(6380);

    assertEquals("redis://redis.local:6380", MatchCacheRedisUriSupport.buildUri(properties));
  }

  @Test
  void prefersExplicitUrl() {
    RedisProperties properties = new RedisProperties();
    properties.setUrl("rediss://cache.example:6379/1");

    assertEquals("rediss://cache.example:6379/1", MatchCacheRedisUriSupport.buildUri(properties));
  }
}
