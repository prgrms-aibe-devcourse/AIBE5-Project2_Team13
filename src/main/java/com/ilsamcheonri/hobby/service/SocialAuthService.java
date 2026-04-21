package com.ilsamcheonri.hobby.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.ilsamcheonri.hobby.dto.LoginResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SocialAuthService {

    private final WebClient.Builder webClientBuilder;
    private final MemberService memberService;

    @Value("${oauth.naver.client-id:}")
    private String naverClientId;

    @Value("${oauth.naver.client-secret:}")
    private String naverClientSecret;

    @Value("${oauth.kakao.client-id:}")
    private String kakaoClientId;

    @Value("${oauth.kakao.client-secret:}")
    private String kakaoClientSecret;

    @Value("${oauth.google.client-id:}")
    private String googleClientId;

    @Value("${oauth.google.client-secret:}")
    private String googleClientSecret;

    @Value("${app.backend-base-url:http://localhost:8080}")
    private String backendBaseUrl;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public SocialAuthorizationStart prepareAuthorizationRedirect(String providerValue) {
        SocialProvider provider = SocialProvider.from(providerValue);
        validateProviderConfigured(provider);

        String state = UUID.randomUUID().toString();
        String redirectUrl = buildAuthorizationUrl(provider, state);

        return new SocialAuthorizationStart(redirectUrl, state, getStateCookieName(provider));
    }

    @Transactional
    public String handleCallback(String providerValue, String code, String state, String expectedState) {
        SocialProvider provider = SocialProvider.from(providerValue);
        validateProviderConfigured(provider);

        if (expectedState == null || expectedState.isBlank() || !expectedState.equals(state)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "소셜 로그인 상태 검증에 실패했습니다.");
        }

        String accessToken = exchangeCodeForAccessToken(provider, code, state);
        SocialUserProfile profile = fetchUserProfile(provider, accessToken);
        LoginResponseDto loginResponse = memberService.loginWithSocial(profile.email(), profile.name());

        return UriComponentsBuilder
                .fromUriString(frontendBaseUrl + "/login")
                .queryParam("token", loginResponse.getAccessToken())
                .queryParam("social", provider.name().toLowerCase(Locale.ROOT))
                .encode(StandardCharsets.UTF_8)
                .build()
                .toUriString();
    }

    public String buildFailureRedirect(String message) {
        return UriComponentsBuilder
                .fromUriString(frontendBaseUrl + "/login")
                .queryParam("error", message == null ? "소셜 로그인 처리 중 오류가 발생했습니다." : message)
                .encode(StandardCharsets.UTF_8)
                .build()
                .toUriString();
    }

    public String getStateCookieName(String providerValue) {
        return getStateCookieName(SocialProvider.from(providerValue));
    }

    private String getStateCookieName(SocialProvider provider) {
        return "SOCIAL_OAUTH_STATE_" + provider.name();
    }

    private String buildAuthorizationUrl(SocialProvider provider, String state) {
        String redirectUri = buildCallbackUrl(provider);

        return switch (provider) {
            case NAVER -> UriComponentsBuilder.fromUriString("https://nid.naver.com/oauth2.0/authorize")
                    .queryParam("response_type", "code")
                    .queryParam("client_id", naverClientId)
                    .queryParam("redirect_uri", redirectUri)
                    .queryParam("state", state)
                    .encode(StandardCharsets.UTF_8)
                    .build()
                    .toUriString();
            case KAKAO -> UriComponentsBuilder.fromUriString("https://kauth.kakao.com/oauth/authorize")
                    .queryParam("response_type", "code")
                    .queryParam("client_id", kakaoClientId)
                    .queryParam("redirect_uri", redirectUri)
                    .queryParam("scope", "profile_nickname,account_email")
                    .queryParam("state", state)
                    .encode(StandardCharsets.UTF_8)
                    .build()
                    .toUriString();
            case GOOGLE -> UriComponentsBuilder.fromUriString("https://accounts.google.com/o/oauth2/v2/auth")
                    .queryParam("response_type", "code")
                    .queryParam("client_id", googleClientId)
                    .queryParam("redirect_uri", redirectUri)
                    .queryParam("scope", "openid email profile")
                    .queryParam("state", state)
                    .encode(StandardCharsets.UTF_8)
                    .build()
                    .toUriString();
        };
    }

    private String buildCallbackUrl(SocialProvider provider) {
        return backendBaseUrl + "/api/auth/" + provider.name().toLowerCase(Locale.ROOT) + "/callback";
    }

    private String exchangeCodeForAccessToken(SocialProvider provider, String code, String state) {
        JsonNode tokenResponse = switch (provider) {
            case NAVER -> webClientBuilder.build()
                    .post()
                    .uri(UriComponentsBuilder.fromUriString("https://nid.naver.com/oauth2.0/token")
                            .queryParam("grant_type", "authorization_code")
                            .queryParam("client_id", naverClientId)
                            .queryParam("client_secret", naverClientSecret)
                            .queryParam("code", code)
                            .queryParam("state", state)
                            .build(true)
                            .toUri())
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
            case KAKAO -> webClientBuilder.build()
                    .post()
                    .uri("https://kauth.kakao.com/oauth/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .bodyValue(buildFormBody(
                            "grant_type", "authorization_code",
                            "client_id", kakaoClientId,
                            "client_secret", kakaoClientSecret,
                            "redirect_uri", buildCallbackUrl(provider),
                            "code", code
                    ))
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
            case GOOGLE -> webClientBuilder.build()
                    .post()
                    .uri("https://oauth2.googleapis.com/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .bodyValue(buildFormBody(
                            "grant_type", "authorization_code",
                            "client_id", googleClientId,
                            "client_secret", googleClientSecret,
                            "redirect_uri", buildCallbackUrl(provider),
                            "code", code
                    ))
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
        };

        if (tokenResponse == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "소셜 로그인 토큰 응답을 받지 못했습니다.");
        }

        String accessToken = tokenResponse.path("access_token").asText("");
        if (accessToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "소셜 로그인 토큰 교환에 실패했습니다.");
        }

        return accessToken;
    }

    private SocialUserProfile fetchUserProfile(SocialProvider provider, String accessToken) {
        JsonNode userInfo = switch (provider) {
            case NAVER -> webClientBuilder.build()
                    .get()
                    .uri("https://openapi.naver.com/v1/nid/me")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
            case KAKAO -> webClientBuilder.build()
                    .get()
                    .uri("https://kapi.kakao.com/v2/user/me")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
            case GOOGLE -> webClientBuilder.build()
                    .get()
                    .uri("https://openidconnect.googleapis.com/v1/userinfo")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
        };

        if (userInfo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "소셜 로그인 사용자 정보를 받지 못했습니다.");
        }

        return switch (provider) {
            case NAVER -> {
                JsonNode response = userInfo.path("response");
                yield createProfile(
                        response.path("email").asText(""),
                        response.path("name").asText(response.path("nickname").asText(""))
                );
            }
            case KAKAO -> {
                JsonNode kakaoAccount = userInfo.path("kakao_account");
                JsonNode profile = kakaoAccount.path("profile");
                yield createProfile(
                        kakaoAccount.path("email").asText(""),
                        profile.path("nickname").asText("")
                );
            }
            case GOOGLE -> createProfile(
                    userInfo.path("email").asText(""),
                    userInfo.path("name").asText("")
            );
        };
    }

    private SocialUserProfile createProfile(String email, String name) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        String normalizedName = name == null ? "" : name.trim();

        if (normalizedEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "소셜 계정 이메일 정보를 확인할 수 없습니다.");
        }

        if (normalizedName.isBlank()) {
            normalizedName = normalizedEmail.split("@")[0];
        }

        return new SocialUserProfile(normalizedEmail, normalizedName);
    }

    private void validateProviderConfigured(SocialProvider provider) {
        boolean configured = switch (provider) {
            case NAVER -> !naverClientId.isBlank() && !naverClientSecret.isBlank();
            case KAKAO -> !kakaoClientId.isBlank();
            case GOOGLE -> !googleClientId.isBlank() && !googleClientSecret.isBlank();
        };

        if (!configured) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, provider.name() + " 소셜 로그인 설정이 비어 있습니다.");
        }
    }

    private String buildFormBody(String... pairs) {
        StringBuilder builder = new StringBuilder();

        for (int i = 0; i < pairs.length; i += 2) {
            String key = pairs[i];
            String value = pairs[i + 1] == null ? "" : pairs[i + 1];

            if (builder.length() > 0) {
                builder.append('&');
            }

            builder.append(URLEncoder.encode(key, StandardCharsets.UTF_8));
            builder.append('=');
            builder.append(URLEncoder.encode(value, StandardCharsets.UTF_8));
        }

        return builder.toString();
    }

    public record SocialAuthorizationStart(String redirectUrl, String state, String stateCookieName) {
    }

    private record SocialUserProfile(String email, String name) {
    }

    private enum SocialProvider {
        NAVER,
        KAKAO,
        GOOGLE;

        private static SocialProvider from(String value) {
            try {
                return SocialProvider.valueOf(value.trim().toUpperCase(Locale.ROOT));
            } catch (Exception exception) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "지원하지 않는 소셜 로그인 제공자입니다.");
            }
        }
    }
}
