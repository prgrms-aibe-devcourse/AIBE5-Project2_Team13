package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.FreelancerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

// 4. 프리랜서 프로필 (FreelancerProfileRepository.java)
public interface FreelancerProfileRepository extends JpaRepository<FreelancerProfile, Long> {
}