package com.ilsamcheonri.hobby.security;

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
import java.util.ArrayList;

/**
 * ⚠️ 이 필터는 현재 비활성화 상태입니다.
 *
 * 이유:
 * - jwt/JwtAuthenticationFilter (JwtTokenProvider 사용) 가 SecurityConfig에 정식 등록되어 있습니다.
 * - 두 필터가 동시에 실행되면 서로 다른 키 처리 방식(BASE64 vs getBytes) 때문에
 *   SignatureException이 발생합니다.
 * - @Component를 제거하여 Spring이 자동으로 Bean 등록하지 않도록 했습니다.
 * - JwtUtil(security 패키지)도 현재 사용되지 않습니다.
 *
 * 추후 이 필터가 필요한 경우 @Component를 다시 추가하고,
 * SecurityConfig에서 JwtAuthenticationFilter를 제거한 뒤 통일해서 사용하세요.
 */
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. 사용자의 요청 헤더에서 "Bearer [토큰값]" 형태의 출입증을 꺼냅니다.
        String token = resolveToken(request);

        // 2. 출입증이 존재하고, 위조되지 않은 진짜라면?
        if (token != null && jwtUtil.validateToken(token)) {
            String email = jwtUtil.extractEmail(token);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(email, null, new ArrayList<>());

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 3. 검문소를 통과하여 다음 단계(Controller 등)로 요청을 넘겨줍니다.
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