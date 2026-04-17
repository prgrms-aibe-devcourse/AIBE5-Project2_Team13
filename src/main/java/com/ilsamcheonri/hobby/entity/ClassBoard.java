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

    @Column(length = 20)
    private String status = "OPEN"; // OPEN(열림), CLOSE(닫힘)

    @Column(columnDefinition = "TEXT")
    private String curriculum;

    @Column(length = 255)
    private String location;

    // ✅ 수정된 부분: 특수문자 컬럼 삭제 후 표준 BOOLEAN 타입 적용
    @Column(name = "is_online", nullable = false)
    private boolean isOnline; // TRUE(온라인), FALSE(오프라인)

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted")
    private boolean isDeleted;

    /**
     * [비즈니스 로직] 소프트 삭제 처리
     * 소프트 삭제란?
     * - DELETE 쿼리로 실제 row를 지우는 대신 is_deleted = true 로만 표시합니다.
     * - 이렇게 하면 나중에 데이터 복구가 가능하고, 삭제 이력도 남아 추적이 쉽습니다.
     * - 이 프로젝트의 모든 테이블이 is_deleted 컬럼을 가지므로 이 방식을 표준으로 씁니다.
     * Service 메서드에 @Transactional이 붙어 있으면,
     * 메서드가 끝날 때 JPA가 변경된 필드를 감지해서 자동으로 UPDATE 쿼리를 날립니다.
     * (이것을 "더티 체킹(Dirty Checking)"이라고 합니다.)
     */
    public void softDelete() {
        this.isDeleted = true;
    }

    // 업데이트 메서드들
    public void updateTitle(String title) { this.title = title; }
    public void updateDescription(String description) { this.description = description; }
    public void updatePrice(Integer price) { this.price = price; }
    public void updateIsOnline(Boolean isOnline) { this.isOnline = isOnline; }
    public void updateStartAt(LocalDateTime startAt) { this.startAt = startAt; }
    public void updateEndAt(LocalDateTime endAt) { this.endAt = endAt; }
    public void updateMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }
    public void updateCurriculum(String curriculum) { this.curriculum = curriculum; }
    public void updateLocation(String location) { this.location = location; }
}
