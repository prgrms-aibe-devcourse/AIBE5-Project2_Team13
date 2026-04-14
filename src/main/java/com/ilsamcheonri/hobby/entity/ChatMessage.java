package com.ilsamcheonri.hobby.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "CHAT_MESSAGE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Member sender;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Builder.Default
    @Column(name = "is_read")
    private boolean isRead = false;

    @CreationTimestamp
    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt;

    @Builder.Default
    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    public void markAsRead() {
        this.isRead = true;
    }
}