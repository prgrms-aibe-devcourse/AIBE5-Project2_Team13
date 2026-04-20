package com.ilsamcheonri.hobby.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ilsamcheonri.hobby.dto.chat.ChatSendMessageRequestDto;
import com.ilsamcheonri.hobby.dto.chat.ChatSocketEventDto;
import com.ilsamcheonri.hobby.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;
    private final ChatService chatService;

    // 한 사용자가 여러 탭을 열 수 있으므로 이메일별로 WebSocket 세션 집합을 관리합니다.
    private final Map<String, Set<WebSocketSession>> sessionsByEmail = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String memberEmail = getMemberEmail(session);
        sessionsByEmail.computeIfAbsent(memberEmail, key -> ConcurrentHashMap.newKeySet()).add(session);
    }

    // 브라우저가 보낸 채팅 이벤트를 받아 메시지를 저장하고, 양쪽 참가자 세션으로 push 합니다.
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        try {
            ChatSendMessageRequestDto request = objectMapper.readValue(message.getPayload(), ChatSendMessageRequestDto.class);
            if (!"SEND_MESSAGE".equals(request.getType())) {
                sendError(session, "지원하지 않는 채팅 이벤트입니다.");
                return;
            }

            String memberEmail = getMemberEmail(session);
            var response = chatService.sendMessage(memberEmail, request.getRoomId(), request.getMessage());
            String payload = objectMapper.writeValueAsString(new ChatSocketEventDto("MESSAGE_CREATED", response));

            // 같은 사용자 여러 탭과 상대방 탭 모두에 동일한 신규 메시지 이벤트를 보냅니다.
            for (String participantEmail : chatService.getParticipantEmails(request.getRoomId())) {
                broadcastToEmail(participantEmail, payload);
            }
        } catch (ResponseStatusException ex) {
            sendError(session, ex.getReason());
        } catch (JsonProcessingException ex) {
            sendError(session, "채팅 메시지 형식이 올바르지 않습니다.");
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String memberEmail = getMemberEmail(session);
        Set<WebSocketSession> sessions = sessionsByEmail.get(memberEmail);
        if (sessions == null) {
            return;
        }

        sessions.remove(session);
        if (sessions.isEmpty()) {
            sessionsByEmail.remove(memberEmail);
        }
    }

    // 같은 이메일을 가진 모든 열려 있는 브라우저 세션에 이벤트를 전달합니다.
    private void broadcastToEmail(String email, String payload) throws IOException {
        Set<WebSocketSession> sessions = sessionsByEmail.get(email);
        if (sessions == null) {
            return;
        }

        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(payload));
            }
        }
    }

    // WebSocket도 REST처럼 사용자에게 의미 있는 오류 메시지를 반환합니다.
    private void sendError(WebSocketSession session, String message) throws IOException {
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(
                Map.of("type", "ERROR", "message", message == null ? "채팅 처리 중 오류가 발생했습니다." : message)
        )));
    }

    // handshake interceptor가 심어둔 인증 이메일을 WebSocket 처리에서 재사용합니다.
    private String getMemberEmail(WebSocketSession session) {
        Object memberEmail = session.getAttributes().get("memberEmail");
        return memberEmail == null ? "" : memberEmail.toString();
    }
}
