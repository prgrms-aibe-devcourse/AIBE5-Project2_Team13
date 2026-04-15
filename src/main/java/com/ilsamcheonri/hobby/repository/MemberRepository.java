package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

// 1. 회원 (MemberRepository.java)
public interface MemberRepository extends JpaRepository<Member, Long> {
    @Override
    Optional<Member> findById(Long aLong);

    // 로그인 시 사용: 이메일로 회원 정보 찾기
    Optional<Member> findByEmail(String email);

    // 회원가입 시 사용: 이메일 중복 검사
    boolean existsByEmail(String email);
}