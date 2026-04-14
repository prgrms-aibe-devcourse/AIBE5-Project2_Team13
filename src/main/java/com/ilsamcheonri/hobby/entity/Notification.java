package com.ilsamcheonri.hobby.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "NOTIFICATION")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member receiver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Member sender;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false)
    private String content;

    @Column(name = "related_link")
    private String relatedLink;

    @Builder.Default
    @Column(name = "is_read")
    private boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    public void markAsRead() {
        this.isRead = true;
    }
}