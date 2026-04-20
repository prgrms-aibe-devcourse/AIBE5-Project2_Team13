package com.ilsamcheonri.hobby.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

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

                System.out.println("[JwtAuthenticationFilter] 인증 성공 - URI: " + request.getRequestURI() + ", email: " + email);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                Collections.emptyList()
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
}
