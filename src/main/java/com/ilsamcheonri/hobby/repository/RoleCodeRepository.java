package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.RoleCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// 2. 권한 (RoleCodeRepository.java)
public interface RoleCodeRepository extends JpaRepository<RoleCode, Long> {
    // 기본 권한("U", "F" 등)을 코드로 찾기 위한 메서드
    Optional<RoleCode> findByRoleCode(String roleCode);
}