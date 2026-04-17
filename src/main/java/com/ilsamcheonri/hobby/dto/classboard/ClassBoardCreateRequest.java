package com.ilsamcheonri.hobby.dto.classboard;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassBoardCreateRequest {

    @NotBlank(message = "제목은 필수 입력 값입니다.")
    private String title;

    private String description;

    @NotNull(message = "카테고리는 필수 선택 값입니다.")
    private Long categoryId;

    @PositiveOrZero(message = "가격은 0원 이상이어야 합니다.")
    private Integer price;

    @NotNull(message = "온/오프라인 여부는 필수 선택 값입니다.")
    private Boolean isOnline;

    @NotNull(message = "시작 일시는 필수 입력 값입니다.")
    private LocalDateTime startAt;

    @NotNull(message = "종료 일시는 필수 입력 값입니다.")
    private LocalDateTime endAt;

    private Integer maxCapacity;

    private String curriculum;

    private String location;
}
