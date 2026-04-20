package com.ilsamcheonri.hobby.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ChatRoomListItemDto {
    // 채팅방 리스트에서 상대 정보, 최근 메시지, unread 개수를 한 번에 그리기 위한 DTO입니다.
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
