package com.ilsamcheonri.hobby.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key key;
    private final long expirationTime;

    // application.properties에 설정한 비밀키와 만료 시간을 가져와서 세팅합니다.
    public JwtUtil(
            @Value("${jwt.secret}") String secretKey,
            @Value("${jwt.expiration}") long expirationTime
    ) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        this.expirationTime = expirationTime;
    }

    // 1. 유저의 이메일(또는 ID)을 바탕으로 새로운 JWT 출입증을 발급합니다.
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email) // 출입증의 주인 (이메일)
                .setIssuedAt(new Date(System.currentTimeMillis())) // 발급 시간
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime)) // 만료 시간
                .signWith(key, SignatureAlgorithm.HS256) // 일삼천리 팀의 비밀키로 암호화 도장 쾅!
                .compact();
    }

    // 2. 출입증에서 유저의 이메일(ID)을 다시 뽑아냅니다.
    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 3. 사용자가 가져온 출입증이 위조되지 않았는지, 기한이 지나지 않았는지 검사합니다.
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true; // 정상적인 토큰일 경우 true 반환
        } catch (SecurityException | MalformedJwtException e) {
            System.out.println("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            System.out.println("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            System.out.println("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            System.out.println("JWT 토큰이 잘못되었습니다.");
        }
        return false;
    }
}