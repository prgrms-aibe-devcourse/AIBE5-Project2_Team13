package com.ilsamcheonri.hobby.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ChatMessageResponseDto {
    // REST 이력 조회와 WebSocket 신규 메시지 이벤트에서 공통으로 쓰는 메시지 응답입니다.
    private Long messageId;
    private Long roomId;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String message;
    private boolean read;
    private LocalDateTime sentAt;
}
