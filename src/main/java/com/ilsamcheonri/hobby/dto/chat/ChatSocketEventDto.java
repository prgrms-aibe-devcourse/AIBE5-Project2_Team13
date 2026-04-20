package com.ilsamcheonri.hobby.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChatSocketEventDto {
    // 브라우저가 신규 메시지 이벤트를 구분하기 쉽게 감싼 WebSocket 응답 DTO입니다.
    private String type;
    private ChatMessageResponseDto payload;
}
