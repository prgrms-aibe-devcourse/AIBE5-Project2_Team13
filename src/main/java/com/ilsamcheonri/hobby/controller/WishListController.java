package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.service.WishListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 📡 찜(WishList) API 엔드포인트
 *
 * GET    /api/wishes/{classId}        → 찜 여부 조회 (상세 페이지 진입 시 하트 상태 확인)
 * POST   /api/wishes/{classId}        → 찜 등록 (빈 하트 → 채운 하트)
 * DELETE /api/wishes/{classId}        → 찜 취소 (채운 하트 → 빈 하트)
 *
 * 모든 API는 로그인(JWT 토큰)이 필요합니다.
 */
@RestController
@RequestMapping("/api/wishes")
@RequiredArgsConstructor
public class WishListController {

    private final WishListService wishListService;

    /**
     * 내 찜 classId 목록 조회
     * 목록 화면 진입 시 한 번만 호출 → 카드마다 찜 여부를 일괄 판단
     *
     * 응답 예시: [1, 5, 12]
     */
    @GetMapping
    public ResponseEntity<java.util.List<Long>> getMyWishIds(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(wishListService.getWishedClassIds(email));
    }

    /**
     * 찜 여부 조회
     * 상세 페이지 진입 시 호출 → 하트 채움/빔 초기 상태 결정
     */
    @GetMapping("/{classId}")
    public ResponseEntity<Map<String, Boolean>> getWishStatus(
            @PathVariable Long classId,
            @AuthenticationPrincipal String email
    ) {
        boolean wished = wishListService.isWished(email, classId);
        // Map.of()로 간단하게 JSON 응답 생성: { "wished": true/false }
        return ResponseEntity.ok(Map.of("wished", wished));
    }

    /**
     * 찜 등록
     * 빈 하트 클릭 → WISH_LIST 테이블에 row 추가
     *
     * 응답: 201 Created
     */
    @PostMapping("/{classId}")
    public ResponseEntity<Void> addWish(
            @PathVariable Long classId,
            @AuthenticationPrincipal String email
    ) {
        wishListService.addWish(email, classId);
        return ResponseEntity.status(201).build();
    }

    /**
     * 찜 취소
     * 채운 하트 클릭 → WISH_LIST 테이블에서 row 실제 삭제
     *
     * 응답: 204 No Content
     */
    @DeleteMapping("/{classId}")
    public ResponseEntity<Void> removeWish(
            @PathVariable Long classId,
            @AuthenticationPrincipal String email
    ) {
        wishListService.removeWish(email, classId);
        return ResponseEntity.noContent().build();
    }
}
