package com.ilsamcheonri.hobby.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    private final long accessTokenValidity = 1000 * 60 * 60; // 1시간으로 변경
    private final long refreshTokenValidity = 1000L * 60 * 60 * 24 * 7; // 7일

    public String createAccessToken(String email, String role) {
        return createToken(email, accessTokenValidity, Map.of("role", role));
    }

    public String createRefreshToken(String email) {
        return createToken(email, refreshTokenValidity, Map.of());
    }

    private String createToken(String email, long validity, Map<String, Object> claims) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + validity);

        return Jwts.builder()
                .setSubject(email)
                .addClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public void validateToken(String token) {
        Jwts.parserBuilder()
                .setSigningKey(key)
                .setAllowedClockSkewSeconds(60) // 1분 허용 오차
                .build()
                .parseClaimsJws(token);
    }

    public String getEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * @author 김한비
     * @since 2026.04.23
     *
     * JWT 토큰에서 사용자 권한(role)을 추출합니다.
     * - 서명 키로 토큰을 검증 후 Claims 파싱
     * - payload의 "role" 값을 String 형태로 반환
     *
     * @param token JWT 토큰
     * @return 사용자 권한 (예: ROLE_USER)
     */
    public String getRole(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("role", String.class);
    }
}
