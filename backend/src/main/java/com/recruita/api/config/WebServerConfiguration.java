package com.recruita.api.config;

import com.recruita.api.config.properties.RecruitaProperties;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.ForwardedHeaderFilter;

@Configuration
public class WebServerConfiguration {

  private static final int FORWARDED_HEADER_FILTER_ORDER = Ordered.HIGHEST_PRECEDENCE + 10;

  @Bean
  WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatMaxPostSizeCustomizer(
      RecruitaProperties properties) {
    int maxPostSize = properties.getSecurity().getHttp().getMaxJsonBodyBytes();
    return factory ->
        factory.addConnectorCustomizers(connector -> connector.setMaxPostSize(maxPostSize));
  }

  @Bean
  FilterRegistrationBean<ForwardedHeaderFilter> trustedForwardedHeaderFilter(
      RecruitaProperties properties) {
    FilterRegistrationBean<ForwardedHeaderFilter> registration = new FilterRegistrationBean<>();
    registration.setFilter(new ForwardedHeaderFilter());
    registration.setOrder(FORWARDED_HEADER_FILTER_ORDER);
    registration.setEnabled(properties.getSecurity().getHttp().isTrustProxy());
    return registration;
  }
}
