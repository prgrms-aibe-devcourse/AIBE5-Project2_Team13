package com.ilsamcheonri.hobby.dto.requestclass;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 📥 요청 클래스 생성 시 프론트엔드에서 받아오는 데이터 DTO
 *
 * DTO(Data Transfer Object)란?
 * - 계층 간 데이터를 전달하는 전용 객체입니다.
 * - Entity를 직접 Controller에서 받으면 DB 구조가 외부에 노출되므로
 *   보안상 DTO를 별도로 만들어 사용하는 것이 표준 패턴입니다.
 *
 * REQUEST 타입 클래스란?
 * - 일반 사용자(수강생)가 "이런 클래스를 열어주세요" 하고 요청하는 게시글입니다.
 * - OFFER(전문가가 개설) vs REQUEST(수강생이 요청) 으로 구분됩니다.
 */
@Getter
@NoArgsConstructor   // Jackson이 JSON → 객체 변환 시 기본 생성자가 필요함
@AllArgsConstructor
@Builder
public class RequestClassCreateRequest {

    /**
     * 요청 클래스 제목
     * 예) "홍대 근처에서 수채화 기초 클래스 열어주세요"
     */
    @NotBlank(message = "제목은 필수 입력 값입니다.")
    private String title;

    /**
     * 요청 클래스 상세 설명
     * 예) "주말 오전에 2시간 정도, 완전 초보도 가능한 수채화 수업 원합니다."
     */
    private String description;

    /**
     * 카테고리 ID (CATEGORY 테이블의 PK)
     * 예) 1 = 미술, 2 = 음악 등
     */
    @NotNull(message = "카테고리는 필수 선택 값입니다.")
    private Long categoryId;

    /**
     * 희망 가격 (원 단위)
     * 0 이상의 값만 허용 (음수 방지)
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
     * 희망 클래스 시작 일시
     * MVP 단계에서는 과거/현재 날짜도 허용합니다. (@Future 제거)
     */
    @NotNull(message = "시작 일시는 필수 입력 값입니다.")
    private LocalDateTime startAt;

    /**
     * 희망 클래스 종료 일시
     */
    @NotNull(message = "종료 일시는 필수 입력 값입니다.")
    private LocalDateTime endAt;

    /**
     * 최대 수강 인원
     * 기본값은 Service에서 1로 처리합니다.
     */
    private Integer maxCapacity;
}
