package com.ilsamcheonri.hobby.dto.classorder;

import com.ilsamcheonri.hobby.entity.ClassOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 마이페이지 수강 관리용 ClassOrder 요약 응답 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassOrderSummaryResponse {
    private Long orderId;
    private Long classId;
    private String classTitle;
    private Integer price;
    private String approvalStatus;
    private String appliedAt;

    public static ClassOrderSummaryResponse from(ClassOrder order) {
        return ClassOrderSummaryResponse.builder()
                .orderId(order.getId())
                .classId(order.getClassBoard().getId())
                .classTitle(order.getClassBoard().getTitle())
                .price(order.getAmount())
                .approvalStatus(order.getApprovalStatus().name())
                .appliedAt(order.getCreatedAt() != null ? order.getCreatedAt().toString() : null)
                .build();
    }
}
