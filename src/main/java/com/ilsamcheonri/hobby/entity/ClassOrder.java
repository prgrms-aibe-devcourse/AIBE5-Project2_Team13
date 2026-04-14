package com.ilsamcheonri.hobby.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "CLASS_ORDER")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ClassOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 주문한 클래스와의 연관관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassBoard classBoard;

    // 주문한 수강생과의 연관관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Member student;

    @Column(nullable = false)
    private Integer amount;

    // ERD 반영: APPROVED(승인), REJECTED(거절), PENDING(진행중)
    @Column(name = "approval_status", length = 20)
    private String approvalStatus;

    // ERD 반영: BEFORE_START, IN_PROGRESS, COMPLETED, DENY
    @Builder.Default
    @Column(name = "progress_status", length = 20)
    private String progressStatus = "BEFORE_START";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ERD 반영: BOOLEAN DEFAULT FALSE
    @Builder.Default
    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    // [비즈니스 로직] 결제 및 신청 승인 처리
    public void processApproval(String status) {
        this.approvalStatus = status;
        // 승인 완료 시 진행 상태를 IN_PROGRESS로 변경할 수 있습니다.
        if ("APPROVED".equals(status)) {
            this.progressStatus = "IN_PROGRESS";
        }
    }
}