package com.ilsamcheonri.hobby.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "FREELANCER_PROFILE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class FreelancerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "freelancer_profile_id") // ERD의 PK 이름 반영
    private Long id;

    // Member와의 연관관계 (프리랜서 본인)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private Member freelancer;

    // Category와의 연관관계 (전문 분야)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialty", nullable = false)
    private Category specialty;

    @Column(name = "sns_link", nullable = false, length = 255)
    private String snsLink;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 200)
    private String img;

    @Column(name = "bank_account", length = 100)
    private String bankAccount;

    @Column(name = "approval_status_name", length = 20)
    private String approvalStatusName;

    // ERD 반영: W(대기), A(승인), R(거절)
    @Builder.Default
    @Column(name = "approval_status_code", length = 5)
    private String approvalStatusCode = "W";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ERD 반영: BOOLEAN DEFAULT FALSE
    @Builder.Default
    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    // [비즈니스 로직] 관리자 승인 처리
    public void approveProfile(String approvalStatusName) {
        this.approvalStatusCode = "A";
        this.approvalStatusName = approvalStatusName;
    }
}