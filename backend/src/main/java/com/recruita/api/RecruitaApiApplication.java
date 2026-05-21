package com.recruita.api;

import com.recruita.api.config.properties.RecruitaProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
@EnableConfigurationProperties(RecruitaProperties.class)
public class RecruitaApiApplication {

  public static void main(String[] args) {
    SpringApplication.run(RecruitaApiApplication.class, args);
  }
}
