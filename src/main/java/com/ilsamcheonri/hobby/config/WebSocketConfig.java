package com.ilsamcheonri.hobby.config;

import com.ilsamcheonri.hobby.websocket.ChatWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatWebSocketHandler chatWebSocketHandler;
    private final ChatHandshakeInterceptor chatHandshakeInterceptor;

    // 프론트는 /ws/chat 으로 연결하고, JWT 검증은 handshake interceptor가 선처리합니다.
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatWebSocketHandler, "/ws/chat")
                // 로컬 협업/테스트에서는 접속 호스트(IP, localhost 등)가 달라질 수 있으므로 origin 패턴을 넓게 허용합니다.
                // 실제 인증은 handshake interceptor의 JWT 검증이 담당합니다.
                .setAllowedOriginPatterns("*")
                .addInterceptors(chatHandshakeInterceptor);
    }
}
