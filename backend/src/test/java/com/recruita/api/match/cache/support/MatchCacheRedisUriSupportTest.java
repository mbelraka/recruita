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

  @Test
  void urlEncodesPasswordSpecialCharacters() {
    RedisProperties properties = new RedisProperties();
    properties.setHost("redis.local");
    properties.setPort(6379);
    properties.setPassword("p@ss:w/rd%");

    assertEquals(
        "redis://p%40ss%3Aw%2Frd%25@redis.local:6379",
        MatchCacheRedisUriSupport.buildUri(properties));
  }

  @Test
  void includesDatabaseWhenPasswordIsPresent() {
    RedisProperties properties = new RedisProperties();
    properties.setHost("redis.local");
    properties.setPort(6379);
    properties.setPassword("secret");
    properties.setDatabase(2);

    assertEquals(
        "redis://secret@redis.local:6379/2", MatchCacheRedisUriSupport.buildUri(properties));
  }
}
