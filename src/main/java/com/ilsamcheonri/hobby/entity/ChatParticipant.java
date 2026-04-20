package com.ilsamcheonri.hobby.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "CHAT_PARTICIPANT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChatParticipant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom chatRoom;

    @Builder.Default
    @Column(name = "joined_at")
    private LocalDateTime joinedAt = LocalDateTime.now();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // 마지막으로 이 참여자 입장에서 이전 대화 이력을 끊어야 하는 기준 시점입니다.
    // 방 나가기 후 재입장하면 이 시점 이후 메시지만 보이게 할 때 사용합니다.
    @Column(name = "last_cleared_at")
    private LocalDateTime lastClearedAt;

    @Builder.Default
    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    public void leaveRoom() {
        this.isDeleted = true;
        LocalDateTime now = LocalDateTime.now();
        this.deletedAt = now;
        this.lastClearedAt = now;
    }

    // 기존 1:1 채팅방을 재사용할 때 탈퇴 처리된 참여자를 다시 활성화할 수 있게 둡니다.
    public void restoreRoom() {
        this.isDeleted = false;
        this.deletedAt = null;
    }
}
