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

    @Builder.Default
    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    public void leaveRoom() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
    }
}