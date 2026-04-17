package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.FreelancerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// 4. 프리랜서 프로필 (FreelancerProfileRepository.java)
public interface FreelancerProfileRepository extends JpaRepository<FreelancerProfile, Long> {
    Optional<FreelancerProfile> findByFreelancerIdAndIsDeletedFalse(Long freelancerId);
    boolean existsByFreelancerIdAndIsDeletedFalse(Long freelancerId);
    List<FreelancerProfile> findByApprovalStatusCodeAndIsDeletedFalseOrderByCreatedAtAsc(String approvalStatusCode);
}
