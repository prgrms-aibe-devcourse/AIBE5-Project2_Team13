package com.ilsamcheonri.hobby.dto.requestclass;

import com.ilsamcheonri.hobby.entity.ClassBoard;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 📤 요청 클래스 데이터를 프론트엔드로 반환할 때 사용하는 DTO
 *
 * Entity를 그대로 반환하지 않는 이유:
 * 1. 보안: Entity에는 민감한 내부 정보(연관 객체, 지연로딩 등)가 포함될 수 있음
 * 2. 성능: 필요한 필드만 골라서 보내면 불필요한 데이터 전송을 줄일 수 있음
 * 3. 유연성: API 응답 형태를 DB 구조와 독립적으로 관리할 수 있음
 */
@Getter
@Builder
public class RequestClassResponse {

    /** 클래스 고유번호 (CLASS_BOARD.id) */
    private Long id;

    /** 클래스 제목 */
    private String title;

    /** 클래스 상세 설명 */
    private String description;

    /** 카테고리 이름 (예: "미술", "음악") */
    private String categoryName;

    /** 요청자 이름 */
    private String requesterName;

    /** 요청자 이메일 — 프론트에서 본인 글 여부 판단에 사용 */
    private String requesterEmail;

    /** 요청자 ID (member.id) */
    private Long requesterId;

    /** 희망 가격 */
    private Integer price;

    /** 온라인 여부 — Boolean(대문자)을 사용해야 Jackson이 "isOnline"으로 직렬화합니다.
     *  boolean(소문자) + isXxx 필드명 조합 시 getter가 isOnline()이 되어
     *  Jackson이 "online"으로 직렬화하는 버그가 있습니다. */
    private Boolean isOnline;

    /** 희망 시작 일시 */
    private LocalDateTime startAt;

    /** 희망 종료 일시 */
    private LocalDateTime endAt;

    /** 최대 수강 인원 */
    private Integer maxCapacity;

    /** 모집 상태 (OPEN / CLOSE) */
    private String status;

    /** 게시글 생성 일시 */
    private LocalDateTime createdAt;

    /**
     * Entity → Response DTO 변환 정적 팩토리 메서드
     *
     * 정적 팩토리 메서드 패턴이란?
     * - new 키워드 대신 from() 같은 메서드로 객체를 생성하는 방법입니다.
     * - Service에서 "RequestClassResponse.from(classBoard)" 처럼 한 줄로 변환할 수 있어
     *   코드가 훨씬 간결해집니다.
     *
     * @param classBoard DB에서 조회한 ClassBoard Entity
     * @return 프론트엔드에 전달할 RequestClassResponse DTO
     */
    public static RequestClassResponse from(ClassBoard classBoard) {
        return RequestClassResponse.builder()
                .id(classBoard.getId())
                .title(classBoard.getTitle())
                .description(classBoard.getDescription())
                // 연관 엔티티(Category, Member)에서 필요한 정보만 꺼내서 담습니다
                .categoryName(classBoard.getCategory().getName())
                .requesterName(classBoard.getFreelancer().getName())
                .requesterEmail(classBoard.getFreelancer().getEmail())
                .requesterId(classBoard.getFreelancer().getId())
                .price(classBoard.getPrice())
                .isOnline(classBoard.isOnline())
                .startAt(classBoard.getStartAt())
                .endAt(classBoard.getEndAt())
                .maxCapacity(classBoard.getMaxCapacity())
                .status(classBoard.getStatus())
                .createdAt(classBoard.getCreatedAt())
                .build();
    }
}
