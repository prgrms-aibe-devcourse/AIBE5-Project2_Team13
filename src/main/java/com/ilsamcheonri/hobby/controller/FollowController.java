package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.follow.FollowingItemResponse;
import com.ilsamcheonri.hobby.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 📡 팔로우 API 엔드포인트
 *
 * GET    /api/follows                  → 내가 팔로우한 memberId 목록 (하트 일괄 상태)
 * GET    /api/follows/{targetMemberId} → 특정 프리랜서 팔로우 여부
 * POST   /api/follows/{targetMemberId} → 팔로우 등록 (빈 하트 → 채운 하트)
 * DELETE /api/follows/{targetMemberId} → 팔로우 취소 (채운 하트 → 빈 하트)
 * GET    /api/follows/{targetMemberId}/count → 팔로워 수 (비로그인 허용)
 *
 * POST/DELETE/GET(목록) 는 로그인(JWT 토큰) 필요
 */
@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    // =========================================================
    // ✅ GET /api/follows/detail
    // 내가 팔로우한 프리랜서 상세 목록 (이름/이미지/전문분야/팔로워수)
    // 마이페이지 > 팔로잉 화면에서 카드 목록을 그릴 때 사용
    // =========================================================
    @GetMapping("/detail")
    public ResponseEntity<List<FollowingItemResponse>> getMyFollowingDetails(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(followService.getFollowingDetails(email));
    }

    // =========================================================
    // ✅ GET /api/follows
    // 내가 팔로우한 프리랜서 memberId 목록 조회
    // =========================================================
    @GetMapping
    public ResponseEntity<List<Long>> getMyFollowingIds(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(followService.getFollowingTargetIds(email));
    }

    // =========================================================
    // ✅ GET /api/follows/{targetMemberId}
    // 특정 프리랜서 팔로우 여부 조회
    // 응답: { "following": true/false }
    // =========================================================
    @GetMapping("/{targetMemberId}")
    public ResponseEntity<Map<String, Boolean>> getFollowStatus(
            @PathVariable Long targetMemberId,
            @AuthenticationPrincipal String email
    ) {
        boolean following = followService.isFollowing(email, targetMemberId);
        return ResponseEntity.ok(Map.of("following", following));
    }

    // =========================================================
    // ✅ POST /api/follows/{targetMemberId}
    // 팔로우 등록 — MEMBER_FOLLOW 테이블에 row 추가
    // 응답: 201 Created
    // =========================================================
    @PostMapping("/{targetMemberId}")
    public ResponseEntity<Void> follow(
            @PathVariable Long targetMemberId,
            @AuthenticationPrincipal String email
    ) {
        followService.follow(email, targetMemberId);
        return ResponseEntity.status(201).build();
    }

    // =========================================================
    // ✅ DELETE /api/follows/{targetMemberId}
    // 팔로우 취소 — MEMBER_FOLLOW 테이블에서 row 실제 삭제
    // 응답: 204 No Content
    // =========================================================
    @DeleteMapping("/{targetMemberId}")
    public ResponseEntity<Void> unfollow(
            @PathVariable Long targetMemberId,
            @AuthenticationPrincipal String email
    ) {
        followService.unfollow(email, targetMemberId);
        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // ✅ GET /api/follows/{targetMemberId}/count
    // 특정 프리랜서의 팔로워 수 조회 (비로그인 허용)
    // 응답: { "count": 42 }
    // =========================================================
    @GetMapping("/{targetMemberId}/count")
    public ResponseEntity<Map<String, Long>> getFollowerCount(
            @PathVariable Long targetMemberId
    ) {
        long count = followService.getFollowerCount(targetMemberId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
