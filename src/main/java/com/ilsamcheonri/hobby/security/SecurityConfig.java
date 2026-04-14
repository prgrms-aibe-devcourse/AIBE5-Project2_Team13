package com.ilsamcheonri.hobby.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity // 스프링 시큐리티 필터 체인을 활성화합니다.
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    // 비밀번호를 암호화해주는 도구입니다. 회원가입 시 반드시 사용해야 합니다.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 핵심 보안 정책을 세팅합니다. (Spring Boot 3.x / Security 6.x 최신 방식)
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // 1. REST API는 CSRF 공격을 받을 확률이 적고, JWT를 쓰므로 비활성화합니다.
                .csrf(AbstractHttpConfigurer::disable)
                // 2. 기본 로그인 화면(form login)과 기본 HTTP 인증을 비활성화합니다.
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)

                // 3. 우리 서버는 세션(Session)을 기억하지 않는 상태(STATELESS)로 운영합니다.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. API 엔드포인트별 출입 통제 구역을 설정합니다.
                .authorizeHttpRequests(auth -> auth
                        // 프론트엔드 통신 테스트용 엔드포인트 허용 추가
                        .requestMatchers("/api/test").permitAll()
                        // 로그인, 회원가입 관련 API는 누구나 접근(permitAll) 가능하게 열어둡니다.
                        .requestMatchers("/api/auth/**").permitAll()
                        // 취미 목록 조회 등, 비회원도 볼 수 있어야 하는 API가 있다면 여기에 추가하세요.
                        // .requestMatchers("/api/hobbies/public").permitAll()

                        // 그 외의 모든 요청은 "반드시 인증(로그인)된 사용자"만 접근할 수 있습니다.
                        .anyRequest().authenticated()
                )

                // 5. 사용자가 요청을 보낼 때 기본 인증 필터를 거치기 전에, 우리가 만든 JwtFilter(검문소)를 먼저 거치도록 설정합니다.
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}