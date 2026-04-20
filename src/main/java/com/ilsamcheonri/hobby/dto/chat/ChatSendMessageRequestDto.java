package com.ilsamcheonri.hobby.dto.chat;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatSendMessageRequestDto {
    // 현재는 SEND_MESSAGE 한 종류만 사용하지만, 이벤트 확장을 위해 type 필드를 둡니다.
    private String type;
    private Long roomId;
    private String message;
}
