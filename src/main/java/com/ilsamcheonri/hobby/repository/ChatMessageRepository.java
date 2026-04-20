package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

// 15. 채팅 메시지 (ChatMessageRepository.java)
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // 방 입장 시에는 참여자별 lastClearedAt 이후 메시지만 보여서, 나갔다 다시 들어온 사용자는 새 방처럼 보이게 합니다.
    @Query("""
        select cm
        from ChatMessage cm
        where cm.chatRoom.id = :roomId
          and cm.isDeleted = false
          and (:lastClearedAt is null or cm.sentAt > :lastClearedAt)
        order by cm.sentAt asc
    """)
    List<ChatMessage> findVisibleMessagesByRoomId(
            @Param("roomId") Long roomId,
            @Param("lastClearedAt") java.time.LocalDateTime lastClearedAt
    );

    // 채팅방 목록의 unread badge도 lastClearedAt 이후 메시지만 계산합니다.
    @Query("""
        select count(cm)
        from ChatMessage cm
        where cm.chatRoom.id = :roomId
          and cm.isDeleted = false
          and cm.isRead = false
          and cm.sender.id <> :memberId
          and (:lastClearedAt is null or cm.sentAt > :lastClearedAt)
    """)
    long countUnreadMessages(
            @Param("roomId") Long roomId,
            @Param("memberId") Long memberId,
            @Param("lastClearedAt") java.time.LocalDateTime lastClearedAt
    );

    // 읽음 처리도 현재 참여자에게 보여야 하는 범위(lastClearedAt 이후) 안에서만 수행합니다.
    @Query("""
        select cm
        from ChatMessage cm
        where cm.chatRoom.id = :roomId
          and cm.isDeleted = false
          and cm.isRead = false
          and cm.sender.id <> :memberId
          and (:lastClearedAt is null or cm.sentAt > :lastClearedAt)
    """)
    List<ChatMessage> findUnreadMessagesByRoomIdAndReaderId(
            @Param("roomId") Long roomId,
            @Param("memberId") Long memberId,
            @Param("lastClearedAt") java.time.LocalDateTime lastClearedAt
    );
}
