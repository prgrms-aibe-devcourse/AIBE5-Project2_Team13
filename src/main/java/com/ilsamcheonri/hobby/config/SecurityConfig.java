package com.ilsamcheonri.hobby.config;

import com.ilsamcheonri.hobby.jwt.JwtAuthenticationFilter;
import com.ilsamcheonri.hobby.jwt.JwtTokenProvider;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        return new JwtAuthenticationFilter(jwtTokenProvider);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            Object jwtError = request.getAttribute(JwtAuthenticationFilter.JWT_ERROR_ATTR);
                            String message = "인증이 필요합니다.";
                            if (jwtError != null) {
                                String errorString = jwtError.toString();
                                if (errorString.contains("ExpiredJwtException")) {
                                    message = "로그인 세션이 만료되었습니다. 다시 로그인해주세요.";
                                } else {
                                    message = "JWT 인증 실패: " + jwtError;
                                }
                            }
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter().write("{\"message\":\"" + message + "\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter().write("{\"message\":\"접근 권한이 없습니다.\"}");
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        // WebSocket handshake는 JWT를 SecurityFilterChain이 아니라 handshake interceptor에서 검증합니다.
                        .requestMatchers("/ws/**").permitAll()
                        // 카테고리 목록 조회 — 로그인 없이 누구나 접근 가능
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/classes/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/classes/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/classes/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/request-classes/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/files/download/**").permitAll()
                        // 팔로워 수 조회 — 비로그인 허용 (프리랜서 프로필 공개 정보)
                        .requestMatchers(HttpMethod.GET, "/api/follows/*/count").permitAll()
                        // 채팅 REST API는 로그인한 사용자만 접근 가능합니다.
                        .requestMatchers("/api/chat/**").authenticated()
                        .requestMatchers("/api/member/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
