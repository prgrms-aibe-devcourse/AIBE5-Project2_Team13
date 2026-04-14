package com.ilsamcheonri.hobby.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ROLE_CODE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class RoleCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_name", nullable = false, length = 50)
    private String roleName; // 예: 일반 사용자, 프리랜서, 관리자

    // ERD 비고 반영: U(일반), F(프리랜서), A(관리자)
    @Builder.Default
    @Column(name = "role_code", nullable = false, length = 5)
    private String roleCode = "U";

    @Column(length = 100)
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ERD 반영: BOOLEAN DEFAULT FALSE
    @Builder.Default
    @Column(name = "is_deleted")
    private boolean isDeleted = false;
}