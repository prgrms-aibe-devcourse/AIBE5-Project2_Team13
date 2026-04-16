package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.category.CategoryResponse;
import com.ilsamcheonri.hobby.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 카테고리 관련 비즈니스 로직을 담당하는 Service
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * 화면에 노출 가능한 대분류 카테고리 목록을 정렬 순서대로 반환합니다.
     *
     * 조회 조건:
     * - parent가 없는 것 (대분류만, 중분류 제외)
     * - is_visible = true (화면 노출 대상만)
     * - is_deleted = false (삭제되지 않은 것만)
     * - sort_order 오름차순 정렬
     */
    public List<CategoryResponse> getVisibleCategories() {
        return categoryRepository
                .findByParentIsNullAndIsVisibleTrueAndIsDeletedFalseOrderBySortOrderAsc()
                .stream()
                .map(CategoryResponse::from)
                .collect(Collectors.toList());
    }
}
