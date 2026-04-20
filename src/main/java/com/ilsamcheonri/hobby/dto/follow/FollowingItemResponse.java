package com.ilsamcheonri.hobby.dto.follow;

import lombok.Builder;
import lombok.Getter;

/**
 * 📤 마이페이지 팔로잉 목록 화면에서 프리랜서 카드 하나에 필요한 정보
 *
 * GET /api/follows/detail 응답에서 사용됩니다.
 *
 * memberId     : 팔로우 취소 버튼 클릭 시 DELETE /api/follows/{memberId}
 * freelancerId : 프로필 상세 이동 시 /freelancer/{freelancerId}
 */
@Getter
@Builder
public class FollowingItemResponse {

    /** 팔로우 취소 시 사용 */
    private Long memberId;

    /** 프리랜서 상세 프로필 이동 시 사용 */
    private Long freelancerId;

    /** 프리랜서 이름 */
    private String name;

    /** 프로필 이미지 URL (없으면 null) */
    private String imageUrl;

    /** 전문 분야 카테고리명 (예: "미술·공예") */
    private String specialtyCategoryName;

    /** 팔로워 수 */
    private long followerCount;
}
