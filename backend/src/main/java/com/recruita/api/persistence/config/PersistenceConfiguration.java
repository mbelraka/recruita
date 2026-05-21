package com.recruita.api.persistence.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@ConditionalOnProperty(prefix = "recruita.persistence", name = "enabled", havingValue = "true")
@EntityScan(basePackages = "com.recruita.api.persistence.entity")
@EnableJpaRepositories(basePackages = "com.recruita.api.persistence.repository")
public class PersistenceConfiguration {}
