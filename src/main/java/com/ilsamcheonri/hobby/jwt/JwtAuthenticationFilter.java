package com.ilsamcheonri.hobby.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String JWT_ERROR_ATTR = "jwt_error";

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String token = resolveToken(request);

        if (token != null) {
            try {
                jwtTokenProvider.validateToken(token);

                String email = jwtTokenProvider.getEmail(token);
                String role = jwtTokenProvider.getRole(token);

                System.out.println("[JwtAuthenticationFilter] 인증 성공 - URI: " + request.getRequestURI() + ", email: " + email);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                createAuthorities(role)
                        );

                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                System.out.println("[JwtAuthenticationFilter] 토큰 검증 실패 - URI: " + request.getRequestURI() + ", message: " + e.getMessage());
                request.setAttribute(JWT_ERROR_ATTR, e.getClass().getSimpleName() + ": " + e.getMessage());
                SecurityContextHolder.clearContext();
            }
        } else {
            System.out.println("[JwtAuthenticationFilter] 토큰 없음 - URI: " + request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * 사용자 권한 문자열을 Spring Security 권한 객체로 변환합니다.
     * - role 값이 없으면 빈 권한 리스트 반환
     * - 단일 권한을 SimpleGrantedAuthority로 생성
     *
     * @param role 사용자 권한 문자열 (예: ROLE_USER)
     * @return 권한 리스트
     */
    private List<SimpleGrantedAuthority> createAuthorities(String role) {
        if (!StringUtils.hasText(role)) {
            return Collections.emptyList();
        }

        return List.of(new SimpleGrantedAuthority(role));
    }
}
