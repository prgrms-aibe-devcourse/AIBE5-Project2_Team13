package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.FreelancerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// 4. 프리랜서 프로필 (FreelancerProfileRepository.java)
public interface FreelancerProfileRepository extends JpaRepository<FreelancerProfile, Long> {
    Optional<FreelancerProfile> findByFreelancerIdAndIsDeletedFalse(Long freelancerId);
    // 공개 상세는 freelancerId 기준으로 승인 완료된 프로필만 노출합니다.
    Optional<FreelancerProfile> findByFreelancerIdAndApprovalStatusCodeAndIsDeletedFalse(Long freelancerId, String approvalStatusCode);
    boolean existsByFreelancerIdAndIsDeletedFalse(Long freelancerId);
    List<FreelancerProfile> findByApprovalStatusCodeAndIsDeletedFalseOrderByCreatedAtAsc(String approvalStatusCode);
}
