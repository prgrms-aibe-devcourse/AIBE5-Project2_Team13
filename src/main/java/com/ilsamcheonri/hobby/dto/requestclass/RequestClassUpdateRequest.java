package com.ilsamcheonri.hobby.dto.requestclass;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 📥 요청 클래스 수정 시 프론트엔드에서 받아오는 데이터 DTO
 *
 * ⭐ 제목(title)과 카테고리(categoryId)는 수정 불가 — 필드 자체를 제외합니다.
 *
 * 수정 불가 이유:
 * - 프리랜서들이 요청 클래스를 보고 문의를 준비 중일 수 있습니다.
 * - 제목/카테고리가 바뀌면 기존에 보던 클래스를 다시 찾기 어려워집니다.
 * - 수정 가능 항목: 상세 설명, 가격, 온/오프라인, 시작/종료 일시, 최대 인원
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestClassUpdateRequest {

    /** 상세 설명 — 자유롭게 수정 가능 */
    private String description;

    /**
     * 희망 가격 (원 단위)
     * 0 이상의 값만 허용
     */
    @PositiveOrZero(message = "가격은 0원 이상이어야 합니다.")
    private Integer price;

    /**
     * 온라인 여부
     * true = 온라인, false = 오프라인
     */
    @NotNull(message = "온/오프라인 여부는 필수 선택 값입니다.")
    private Boolean isOnline;

    /**
     * 희망 시작 일시
     */
    @NotNull(message = "시작 일시는 필수 입력 값입니다.")
    private LocalDateTime startAt;

    /**
     * 희망 종료 일시
     */
    @NotNull(message = "종료 일시는 필수 입력 값입니다.")
    private LocalDateTime endAt;

    /**
     * 최대 수강 인원
     */
    private Integer maxCapacity;
}
