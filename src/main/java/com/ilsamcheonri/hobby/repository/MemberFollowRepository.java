package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.MemberFollow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MemberFollowRepository extends JpaRepository<MemberFollow, Long> {

    /** 팔로우 여부 확인 — 상세 페이지 하트 상태 */
    boolean existsByFollowerIdAndTargetId(Long followerId, Long targetId);

    /** 팔로우 취소용 단건 조회 */
    Optional<MemberFollow> findByFollowerIdAndTargetId(Long followerId, Long targetId);

    /** 내 팔로우 목록 전체 조회 — targetId(프리랜서 memberId) 목록 */
    List<MemberFollow> findByFollowerId(Long followerId);

    /** 특정 프리랜서를 팔로우하는 팔로워 목록 — 클래스 등록 알림 발송용
     * 2026.04.22 최준열 생성
     * */
    List<MemberFollow> findByTargetId(Long targetId);

    /** 특정 프리랜서의 팔로워 수 */
    long countByTargetId(Long targetId);
}