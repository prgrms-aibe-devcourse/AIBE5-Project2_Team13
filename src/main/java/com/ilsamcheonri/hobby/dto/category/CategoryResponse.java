package com.ilsamcheonri.hobby.dto.category;

import com.ilsamcheonri.hobby.entity.Category;
import lombok.Builder;
import lombok.Getter;

/**
 * 📤 카테고리 정보를 프론트엔드로 반환하는 DTO
 *
 * 프론트엔드에서 카테고리 탭을 그릴 때 필요한 정보만 담습니다.
 * - id        : 카테고리 필터링 기준값 (숫자 ID)
 * - name      : 화면에 표시할 이름 (예: "미술·공예")
 * - sortOrder : 탭 순서
 */
@Getter
@Builder
public class CategoryResponse {

    /** DB의 카테고리 고유번호 → 프론트에서 필터 키로 사용 */
    private Long id;

    /** 화면에 표시할 카테고리 이름 */
    private String name;

    /** 탭 노출 순서 */
    private Integer sortOrder;

    /**
     * Entity → DTO 변환 정적 팩토리 메서드
     */
    public static CategoryResponse from(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .sortOrder(category.getSortOrder())
                .build();
    }
}
