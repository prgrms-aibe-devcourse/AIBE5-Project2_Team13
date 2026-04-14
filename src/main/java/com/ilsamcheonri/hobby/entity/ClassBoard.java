package com.ilsamcheonri.hobby.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "CLASS_BOARD")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ClassBoard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private Member freelancer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Builder.Default
    @Column(name = "board_type", nullable = false, length = 20)
    private String boardType = "OFFER"; // OFFER(판매), REQUEST(요청)

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(nullable = false)
    private Integer price = 0;

    @Builder.Default
    @Column(name = "max_capacity")
    private Integer maxCapacity = 1;

    @Builder.Default
    @Column(name = "current_volume")
    private Integer currentVolume = 0;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Builder.Default
    @Column(length = 20)
    private String status = "OPEN"; // OPEN(열림), CLOSE(닫힘)

    // ✅ 수정된 부분: 특수문자 컬럼 삭제 후 표준 BOOLEAN 타입 적용
    @Builder.Default
    @Column(name = "is_online", nullable = false)
    private boolean isOnline = false; // TRUE(온라인), FALSE(오프라인)

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default
    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    // [비즈니스 로직] 클래스 정보 수정 시 활용
    public void updateClassInfo(String title, String description, Integer price, boolean isOnline) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.isOnline = isOnline;
    }
}