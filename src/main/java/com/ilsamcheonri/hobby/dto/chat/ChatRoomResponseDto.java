package com.ilsamcheonri.hobby.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ChatRoomResponseDto {
    // 방 생성/재사용 직후 프론트가 바로 진입할 수 있도록 최소한의 방 정보를 돌려줍니다.
    private Long roomId;
    private Long otherMemberId;
    private String otherMemberName;
    private String otherMemberRole;
    private String otherMemberEmail;
    private String otherMemberImgUrl;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
}
