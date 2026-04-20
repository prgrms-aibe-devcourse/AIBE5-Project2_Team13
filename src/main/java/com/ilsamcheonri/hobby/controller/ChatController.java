package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.chat.ChatDirectRoomRequestDto;
import com.ilsamcheonri.hobby.dto.chat.ChatMessageResponseDto;
import com.ilsamcheonri.hobby.dto.chat.ChatRoomListItemDto;
import com.ilsamcheonri.hobby.dto.chat.ChatRoomResponseDto;
import com.ilsamcheonri.hobby.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // 채팅 진입 시 "방 생성 또는 기존 방 재사용"을 담당하는 REST 엔드포인트입니다.
    @PostMapping("/rooms/direct")
    public ResponseEntity<?> createOrOpenDirectRoom(
            Authentication authentication,
            @Valid @RequestBody ChatDirectRoomRequestDto request
    ) {
        try {
            ChatRoomResponseDto response = chatService.createOrOpenDirectRoom(authentication.getName(), request);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(Map.of("message", ex.getReason()));
        }
    }

    // 좌측 채팅방 목록을 그리기 위한 REST API입니다.
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomListItemDto>> getMyRooms(Authentication authentication) {
        return ResponseEntity.ok(chatService.getMyRooms(authentication.getName()));
    }

    // 현재 선택한 채팅방의 전체 메시지 이력을 조회합니다.
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<?> getRoomMessages(Authentication authentication, @PathVariable Long roomId) {
        try {
            List<ChatMessageResponseDto> response = chatService.getRoomMessages(authentication.getName(), roomId);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(Map.of("message", ex.getReason()));
        }
    }

    // 방 입장 시 unread 메시지를 read 처리하는 쉬운 읽음 API입니다.
    @PostMapping("/rooms/{roomId}/read")
    public ResponseEntity<?> markRoomAsRead(Authentication authentication, @PathVariable Long roomId) {
        try {
            chatService.markRoomAsRead(authentication.getName(), roomId);
            return ResponseEntity.ok().build();
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(Map.of("message", ex.getReason()));
        }
    }

    // 채팅방 나가기는 현재 사용자 participant만 soft delete 처리해 목록에서만 숨깁니다.
    @PostMapping("/rooms/{roomId}/leave")
    public ResponseEntity<?> leaveRoom(Authentication authentication, @PathVariable Long roomId) {
        try {
            chatService.leaveRoom(authentication.getName(), roomId);
            return ResponseEntity.ok().build();
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(Map.of("message", ex.getReason()));
        }
    }
}
