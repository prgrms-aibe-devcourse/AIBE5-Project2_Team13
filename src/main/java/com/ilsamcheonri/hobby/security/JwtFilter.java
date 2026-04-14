package com.ilsamcheonri.hobby.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
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
            // 토큰에서 유저 이메일을 뽑아냅니다.
            String email = jwtUtil.extractEmail(token);

            // 스프링 시큐리티에게 "이 사람은 인증된 사람이니까 통과시켜줘!" 라고 등록합니다.
            // (지금은 권한 관리를 생략하기 위해 빈 ArrayList를 넣었습니다. 나중에 User/Admin 권한 추가 시 이 부분이 수정됩니다.)
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(email, null, new ArrayList<>());

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 3. 검문소를 통과하여 다음 단계(Controller 등)로 요청을 넘겨줍니다.
        filterChain.doFilter(request, response);
    }

    // 헤더에서 "Bearer "라는 글자를 떼어내고 순수 토큰 값만 추출하는 헬퍼 메서드입니다.
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}