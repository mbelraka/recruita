package com.recruita.api.config.security;

import com.recruita.api.config.properties.RecruitaProperties;
import com.recruita.api.config.properties.SecurityProperties;
import java.util.Locale;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.CrossOriginOpenerPolicyHeaderWriter.CrossOriginOpenerPolicy;
import org.springframework.security.web.header.writers.CrossOriginResourcePolicyHeaderWriter.CrossOriginResourcePolicy;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

  private final RecruitaProperties properties;
  private final CorsConfigurationSource corsConfigurationSource;
  private final MatchRateLimitFilter matchRateLimitFilter;

  public SecurityConfiguration(
      RecruitaProperties properties,
      CorsConfigurationSource corsConfigurationSource,
      MatchRateLimitFilter matchRateLimitFilter) {
    this.properties = properties;
    this.corsConfigurationSource = corsConfigurationSource;
    this.matchRateLimitFilter = matchRateLimitFilter;
  }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    String[] publicPaths = properties.getApi().publicPaths();
    SecurityProperties.HeaderProperties headerProps = properties.getSecurity().getHeaders();
    SecurityProperties.HstsProperties hsts = properties.getSecurity().getHsts();
    SecurityProperties.CorsProperties cors = properties.getSecurity().getCors();
    ReferrerPolicyHeaderWriter.ReferrerPolicy referrerPolicy =
        parseReferrerPolicy(headerProps.getReferrerPolicy());

    http.csrf(AbstractHttpConfigurer::disable)
        .httpBasic(AbstractHttpConfigurer::disable)
        .formLogin(AbstractHttpConfigurer::disable)
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .cors(corsConfig -> corsConfig.configurationSource(corsConfigurationSource))
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers(HttpMethod.OPTIONS, cors.getRegistrationPath())
                    .permitAll()
                    .requestMatchers(publicPaths)
                    .permitAll()
                    .anyRequest()
                    .denyAll())
        .addFilterBefore(matchRateLimitFilter, UsernamePasswordAuthenticationFilter.class)
        .headers(
            headers -> {
              if (headerProps.isFrameDeny()) {
                headers.frameOptions(frame -> frame.deny());
              }
              if (headerProps.isContentTypeOptions()) {
                headers.contentTypeOptions(Customizer.withDefaults());
              }
              if (headerProps.isContentSecurityPolicyEnabled()) {
                headers.contentSecurityPolicy(
                    csp -> csp.policyDirectives(headerProps.getContentSecurityPolicy()));
              }
              if (headerProps.isCacheControlNoStore()) {
                headers.cacheControl(Customizer.withDefaults());
              }
              if (headerProps.isCrossOriginOpenerPolicyEnabled()) {
                headers.crossOriginOpenerPolicy(
                    coop ->
                        coop.policy(
                            parseCrossOriginOpenerPolicy(
                                headerProps.getCrossOriginOpenerPolicy())));
              }
              if (headerProps.isCrossOriginResourcePolicyEnabled()) {
                headers.crossOriginResourcePolicy(
                    corp ->
                        corp.policy(
                            parseCrossOriginResourcePolicy(
                                headerProps.getCrossOriginResourcePolicy())));
              }
              headers.referrerPolicy(referrer -> referrer.policy(referrerPolicy));
              if (hsts.isEnabled()) {
                headers.httpStrictTransportSecurity(
                    hstsConfig ->
                        hstsConfig
                            .includeSubDomains(hsts.isIncludeSubdomains())
                            .maxAgeInSeconds(hsts.getMaxAgeSeconds())
                            .preload(hsts.isPreload()));
              }
              if (headerProps.isPermissionsPolicyEnabled()) {
                headers.addHeaderWriter(
                    (request, response) ->
                        response.setHeader(
                            headerProps.getPermissionsPolicyHeaderName(),
                            headerProps.getPermissionsPolicy()));
              }
            });

    return http.build();
  }

  private static ReferrerPolicyHeaderWriter.ReferrerPolicy parseReferrerPolicy(String raw) {
    String normalized = raw.trim().toUpperCase(Locale.ROOT).replace('-', '_');
    return ReferrerPolicyHeaderWriter.ReferrerPolicy.valueOf(normalized);
  }

  private static CrossOriginOpenerPolicy parseCrossOriginOpenerPolicy(String raw) {
    String normalized = raw.trim().toUpperCase(Locale.ROOT).replace('-', '_');
    return CrossOriginOpenerPolicy.valueOf(normalized);
  }

  private static CrossOriginResourcePolicy parseCrossOriginResourcePolicy(String raw) {
    String normalized = raw.trim().toUpperCase(Locale.ROOT).replace('-', '_');
    return CrossOriginResourcePolicy.valueOf(normalized);
  }
}
