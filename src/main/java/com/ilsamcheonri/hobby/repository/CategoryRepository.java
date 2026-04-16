package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * 대분류 카테고리만 sort_order 오름차순으로 조회
     * - parent IS NULL    → 대분류만 (중분류 제외)
     * - is_visible = true → 화면 노출 대상만
     * - is_deleted = false → 삭제되지 않은 것만
     */
    List<Category> findByParentIsNullAndIsVisibleTrueAndIsDeletedFalseOrderBySortOrderAsc();
}