package com.ilsamcheonri.hobby.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "REPORT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Report {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private Member reporter;

    @Column(name = "target_type", nullable = false, length = 50)
    private String targetType; // CLASS, REVIEW, CHAT, MEMBER 등

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(name = "reason_category", nullable = false, length = 50)
    private String reasonCategory;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    @Column(length = 20)
    private String status = "WAITING"; // WAITING, RESOLVED, REJECTED

    @Column(name = "admin_memo", columnDefinition = "TEXT")
    private String adminMemo;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // [비즈니스 로직] 관리자 신고 처리
    public void resolveReport(String status, String adminMemo) {
        this.status = status;
        this.adminMemo = adminMemo;
    }
}