package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.FreelancerProfileAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FreelancerProfileAttachmentRepository extends JpaRepository<FreelancerProfileAttachment, Long> {
    // 향후 특정 프리랜서 프로필에 달린 포트폴리오 이미지들을 조회할 때 사용할 수 있습니다.
    // List<FreelancerProfileAttachment> findByFreelancerProfileId(Long profileId);
}