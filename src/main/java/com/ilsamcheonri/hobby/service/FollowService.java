package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.follow.FollowingItemResponse;
import com.ilsamcheonri.hobby.entity.FreelancerProfile;
import com.ilsamcheonri.hobby.entity.Member;
import com.ilsamcheonri.hobby.entity.MemberFollow;
import com.ilsamcheonri.hobby.repository.FreelancerProfileRepository;
import com.ilsamcheonri.hobby.repository.MemberFollowRepository;
import com.ilsamcheonri.hobby.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 👤 팔로우(MEMBER_FOLLOW) 비즈니스 로직을 담당하는 Service
 *
 * 찜(WishList)이 클래스를 대상으로 하는 것처럼,
 * 팔로우는 프리랜서(Member)를 대상으로 합니다.
 *
 * 기능:
 * 1. 팔로우 등록       — MEMBER_FOLLOW 테이블에 row 추가
 * 2. 팔로우 취소       — MEMBER_FOLLOW 테이블에서 row 실제 삭제
 * 3. 팔로우 여부 조회  — 버튼 상태(팔로우/팔로잉) 확인
 * 4. 내 팔로우 목록    — 내가 팔로우한 프리랜서 memberId 목록
 * 5. 팔로워 수         — 특정 프리랜서의 팔로워 수
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FollowService {

    private final MemberFollowRepository memberFollowRepository;
    private final MemberRepository       memberRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;

    // =========================================================
    // ✅ 1. 팔로우 등록
    // =========================================================

    /**
     * @param followerEmail  현재 로그인한 사용자 이메일 (팔로우를 하는 쪽)
     * @param targetMemberId 팔로우할 프리랜서의 member.id
     */
    @Transactional
    public void follow(String followerEmail, Long targetMemberId) {

        Member follower = memberRepository.findByEmail(followerEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        // 자기 자신을 팔로우하는 경우 방지
        if (follower.getId().equals(targetMemberId)) {
            throw new IllegalArgumentException("자기 자신을 팔로우할 수 없습니다.");
        }

        Member target = memberRepository.findById(targetMemberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        if (memberFollowRepository.existsByFollowerIdAndTargetId(follower.getId(), targetMemberId)) {
            throw new IllegalStateException("이미 팔로우한 프리랜서입니다.");
        }

        memberFollowRepository.save(
            MemberFollow.builder()
                .follower(follower)
                .target(target)
                .build()
        );
    }

    // =========================================================
    // ✅ 2. 팔로우 취소 (실제 삭제)
    // =========================================================

    /**
     * MEMBER_FOLLOW 테이블에는 is_deleted 컬럼이 없으므로 실제 DELETE 처리합니다.
     */
    @Transactional
    public void unfollow(String followerEmail, Long targetMemberId) {

        Member follower = memberRepository.findByEmail(followerEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        MemberFollow follow = memberFollowRepository
                .findByFollowerIdAndTargetId(follower.getId(), targetMemberId)
                .orElseThrow(() -> new IllegalArgumentException("팔로우하지 않은 프리랜서입니다."));

        memberFollowRepository.delete(follow);
    }

    // =========================================================
    // ✅ 3. 팔로우 여부 조회
    // =========================================================
    public boolean isFollowing(String followerEmail, Long targetMemberId) {

        Member follower = memberRepository.findByEmail(followerEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        return memberFollowRepository
                .existsByFollowerIdAndTargetId(follower.getId(), targetMemberId);
    }

    // =========================================================
    // ✅ 4. 내가 팔로우한 프리랜서 memberId 목록
    // =========================================================

    /**
     * 로그인한 사용자가 팔로우한 프리랜서의 memberId 목록을 반환합니다.
     * 프론트에서 한 번만 호출해 일괄적으로 하트 상태를 처리합니다.
     */
    public List<Long> getFollowingTargetIds(String followerEmail) {

        Member follower = memberRepository.findByEmail(followerEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        return memberFollowRepository.findByFollowerId(follower.getId())
                .stream()
                .map(f -> f.getTarget().getId())
                .collect(Collectors.toList());
    }

    // =========================================================
    // ✅ 5. 팔로워 수 조회
    // =========================================================
    public long getFollowerCount(Long targetMemberId) {
        return memberFollowRepository.countByTargetId(targetMemberId);
    }

    // =========================================================
    // ✅ 6. 팔로잉 상세 목록 — 마이페이지용
    // =========================================================

    /**
     * 내가 팔로우한 프리랜서의 상세 정보(이름/이미지/전문분야/팔로워수)를 반환합니다.
     * 마이페이지 > 팔로잉 화면에서 프리랜서 카드 목록을 그릴 때 사용합니다.
     *
     * 처리 흐름:
     * 1. MEMBER_FOLLOW 테이블에서 내가 팔로우한 target 목록 조회
     * 2. 각 target의 FREELANCER_PROFILE 조회 (승인된 것만)
     * 3. 이름/이미지/전문분야/팔로워수 조합해서 DTO 반환
     */
    public List<FollowingItemResponse> getFollowingDetails(String followerEmail) {

        Member follower = memberRepository.findByEmail(followerEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        return memberFollowRepository.findByFollowerId(follower.getId())
                .stream()
                .map(follow -> {
                    Member target = follow.getTarget();

                    // 프리랜서 프로필 조회 (없거나 미승인이면 기본값 사용)
                    FreelancerProfile profile = freelancerProfileRepository
                            .findByFreelancerIdAndApprovalStatusCodeAndIsDeletedFalse(
                                    target.getId(), "A")
                            .orElse(null);

                    String specialtyCategoryName = (profile != null && profile.getSpecialty() != null)
                            ? profile.getSpecialty().getName()
                            : null;

                    long followerCount = memberFollowRepository.countByTargetId(target.getId());

                    return FollowingItemResponse.builder()
                            .memberId(target.getId())
                            .freelancerId(target.getId()) // 현재 구조에서 freelancerId = member.id
                            .name(target.getName())
                            .imageUrl(target.getImgUrl())
                            .specialtyCategoryName(specialtyCategoryName)
                            .followerCount(followerCount)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
