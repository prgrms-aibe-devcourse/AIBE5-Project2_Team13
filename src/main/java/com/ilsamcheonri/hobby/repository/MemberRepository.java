package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 1. 회원 (MemberRepository.java)
public interface MemberRepository extends JpaRepository<Member, Long> {
    // 로그인 시 사용: 이메일로 회원 정보 찾기
    List<Member> findByEmail(String email);

    // 회원가입 시 사용: 이메일 중복 검사
    boolean existsByEmail(String email);
}