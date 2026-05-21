package com.recruita.api.persistence.config;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Keeps default dev/CI startup free of JDBC, Flyway, and Redis unless the {@code persistence}
 * profile is active. {@code @SpringBootApplication} exclusions cannot be toggled per profile.
 */
@Configuration
@Profile("!persistence")
@EnableAutoConfiguration(
    exclude = {
      DataSourceAutoConfiguration.class,
      HibernateJpaAutoConfiguration.class,
      JpaRepositoriesAutoConfiguration.class,
      FlywayAutoConfiguration.class,
      RedisAutoConfiguration.class,
      RedisRepositoriesAutoConfiguration.class
    })
public class NonPersistenceAutoConfiguration {}
