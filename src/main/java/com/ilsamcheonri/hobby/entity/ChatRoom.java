package com.ilsamcheonri.hobby.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "CHAT_ROOM")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChatRoom {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 채팅방 목록에서 최근 메시지 미리보기를 바로 보여주기 위한 캐시 컬럼입니다.
    @Column(name = "last_message", columnDefinition = "TEXT")
    private String lastMessage;

    // 채팅방 목록을 최신 대화 순으로 정렬하기 위한 최근 메시지 시간입니다.
    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default
    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    public void deleteRoom() {
        this.isDeleted = true;
    }

    // 새 메시지가 저장될 때마다 채팅방 메타데이터도 함께 갱신합니다.
    public void updateLastMessage(String lastMessage, LocalDateTime sentAt) {
        this.lastMessage = lastMessage;
        this.lastMessageAt = sentAt;
    }
}
