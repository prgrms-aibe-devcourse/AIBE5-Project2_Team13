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

    //신청 승인 프로세스
    public enum ApprovalStatus {
        PENDING, //승인 대기
        APPROVED, //승인됨
        REJECTED, //거절됨
        CANCELLED //(학생이) 취소함
        }

    //클래스 진행 상태
    public enum ProgressStatus {
        BEFORE_START,   // 수강 전
        IN_PROGRESS,//승인 후 수강중
        COMPLETED, //수강완료
        REJECTED,  // (프리랜서가) 수강거절(DENY->REJECTED로 변경)
        CANCELLED // 취소됨
    }

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

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 20)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "progress_status", nullable = false, length = 20)
    private ProgressStatus progressStatus = ProgressStatus.IN_PROGRESS;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ERD 반영: BOOLEAN DEFAULT FALSE
    @Builder.Default
    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    public void updateStatus(ApprovalStatus approvalStatus, ProgressStatus progressStatus) {
        this.approvalStatus = approvalStatus;
        this.progressStatus = progressStatus;
    }

}
