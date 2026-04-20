package com.ilsamcheonri.hobby.config;

import com.ilsamcheonri.hobby.jwt.JwtAuthenticationFilter;
import com.ilsamcheonri.hobby.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

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
        configuration.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
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
                /*
                  // GET 요청만 허용
                  .requestMatchers(HttpMethod.GET, "/api/your-endpoint/**").permitAll()

                  // 모든 메서드 허용
                  .requestMatchers("/api/your-endpoint/**").permitAll()
                 */
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        // WebSocket handshake는 JWT를 SecurityFilterChain이 아니라 handshake interceptor에서 검증합니다.
                        .requestMatchers("/ws/**").permitAll()
                        // 카테고리 목록 조회 — 로그인 없이 누구나 접근 가능
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        // OFFER 클래스 목록 조회 — 로그인 없이 누구나 접근 가능
                        .requestMatchers(HttpMethod.GET, "/api/classes/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/classes/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/classes/**").authenticated()
                        // 요청 클래스 목록/상세 조회 — 로그인 없이 누구나 접근 가능
                        .requestMatchers(HttpMethod.GET, "/api/request-classes/**").permitAll()
                        // 파일 다운로드 — 로그인 없이 접근 가능 (이미지 표시용)
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

    // JWT 만료 시간 허용 오차 (클럭 스큐) 설정
    // JWT 라이브러리에서 기본적으로 제공하는 AllowedClockSkew를 통해 처리할 수 있지만,
    // Spring Security 설정을 통해 전역적으로 적용하는 방법이 더 일관적입니다.
    // 여기서는 SecurityConfig에서 별도로 설정하지 않고, Jwts.parserBuilder()에서 처리하도록 합니다.
}
