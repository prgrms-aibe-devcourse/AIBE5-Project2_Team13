package com.ilsamcheonri.hobby.dto.classorder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author 김한비
 * @since 2026.04.23
 *
 * 프리랜서 대시보드 응답 DTO입니다.
 * - 매출, 수강생 수, 평점 등 주요 통계 정보를 포함
 * - 프론트 대시보드 화면에 필요한 데이터를 전달
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FreelancerDashboardResponse {
    private Integer expectedRevenueThisMonth;
    private Integer revenueChangeRate;
    private Integer totalStudents;
    private Integer studentsAddedThisMonth;
    private Double averageRating;
    private Integer reviewCount;
    private Integer totalRevenue;
    private List<TrendItem> trend;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrendItem {
        private String month;
        private Integer revenue;
        private Integer students;
    }
}
