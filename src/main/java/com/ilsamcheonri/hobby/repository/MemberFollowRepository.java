package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.MemberFollow;
import org.springframework.data.jpa.repository.JpaRepository;

// 12. 팔로우 (MemberFollowRepository.java)
public interface MemberFollowRepository extends JpaRepository<MemberFollow, Long> {
}