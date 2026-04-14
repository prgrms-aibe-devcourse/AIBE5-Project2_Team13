package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.MemberAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberAttachmentRepository extends JpaRepository<MemberAttachment, Long> {
    // 향후 특정 회원의 모든 프로필 이미지를 조회하는 기능이 필요하다면 아래와 같이 추가할 수 있습니다.
    // List<MemberAttachment> findByMemberId(Long memberId);
}