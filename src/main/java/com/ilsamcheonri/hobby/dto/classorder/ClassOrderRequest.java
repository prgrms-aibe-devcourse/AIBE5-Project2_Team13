package com.ilsamcheonri.hobby.dto.classorder;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 수강 신청 API 요청 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassOrderRequest {

    @NotNull(message = "클래스 ID는 필수입니다.")
    private Long classBoardId;
}
