package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.category.CategoryResponse;
import com.ilsamcheonri.hobby.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 📡 카테고리 API 엔드포인트
 *
 * GET /api/categories
 * - 인증 없이 누구나 조회 가능 (SecurityConfig에서 permitAll 처리 필요)
 * - 화면 카테고리 탭을 그리는 데 사용됩니다.
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * 화면에 노출할 대분류 카테고리 목록을 반환합니다.
     * 응답 예시:
     * [
     *   { "id": 1, "name": "뷰티·패션", "sortOrder": 1 },
     *   { "id": 2, "name": "음악·악기", "sortOrder": 2 },
     *   ...
     * ]
     */
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(categoryService.getVisibleCategories());
    }
}
