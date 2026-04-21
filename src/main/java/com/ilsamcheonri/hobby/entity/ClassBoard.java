package com.ilsamcheonri.hobby.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @Builder.Default

    @Column(name = "is_deleted")
    private boolean isDeleted = false;

    //"나한테는 이런 애들이 붙어있어!"라고 알려주는 관계 매핑(Mapping) 코드
    //ClassBoardRepository 쿼리 작동 위해 작성함
    @OneToMany(mappedBy = "classBoard", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClassAttachment> attachments = new ArrayList<>();

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
    // 클래스를 삭제 상태로 변경하는 기능
    public void softDelete() {
        this.isDeleted = true;
    }

    /**
     * 클래스(OFFER 타입) 수정 비즈니스 메서드
     */
    // 개설된 클래스의 정보를 일괄 수정하는 기능
    public void updateOfferClass(Category category, String title, String description, Integer price, 
                                 boolean isOnline, LocalDateTime startAt, LocalDateTime endAt, 
                                 Integer maxCapacity, String curriculum, String location) {
        this.category    = category;
        this.title       = title;
        this.description = description;
        this.price       = price;
        this.isOnline    = isOnline;
        this.startAt     = startAt;
        this.endAt       = endAt;
        this.maxCapacity = maxCapacity;
        this.curriculum  = curriculum;
        this.location    = location;
    }

    /**
     * 클래스 수정 메서드
     *
     * JPA 더티 체킹(Dirty Checking):
     * @Transactional 안에서 이 메서드를 호출하면 필드가 변경됐음을 JPA가 감지하고
     * 트랜잭션 종료 시점에 자동으로 UPDATE 쿼리를 실행합니다. (save() 호출 불필요)
     *
     *  TODO: [추후 구현] 신청자 기능이 생기면 신청자가 있을 경우 제목/카테고리 수정 불가 로직 추가 필요
     */
    // 요청된 클래스의 정보를 일괄 수정하는 기능
    public void updateRequestClass(Category category, String title, String description, Integer price, 
                                   boolean isOnline, java.time.LocalDateTime startAt, java.time.LocalDateTime endAt,
                                   Integer maxCapacity) {
        this.category    = category;
        this.title       = title;
        this.description = description;
        this.price       = price;
        this.isOnline    = isOnline;
        this.startAt     = startAt;
        this.endAt       = endAt;
        this.maxCapacity = maxCapacity;
    }

    // 클래스의 모집 상태(OPEN/CLOSE)를 변경하는 기능
    public void updateStatus(String status) {
        this.status = status;
    }

    // 수강 신청이 성공하면 현재 신청 인원을 1 증가시킵니다.
    public void increaseVolume() {
        if (this.currentVolume == null) {
            this.currentVolume = 0;
        }
        this.currentVolume += 1;
    }

    // 수강 신청이 취소되면 현재 신청 인원을 1 감소시킵니다.
    public void decreaseVolume() {
        if (this.currentVolume != null && this.currentVolume > 0) {
            this.currentVolume -= 1;
        }
    }
}
