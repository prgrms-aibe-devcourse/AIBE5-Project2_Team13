package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ilsamcheonri.hobby.dto.MemberSummaryDto;
import com.ilsamcheonri.hobby.dto.MemberDetailDto;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

// 1. 회원 (MemberRepository.java)
public interface MemberRepository extends JpaRepository<Member, Long> {
    @Override
    Optional<Member> findById(Long aLong);

    // 로그인 시 사용: 이메일로 회원 정보 찾기
    Optional<Member> findByEmail(String email);

    Optional<Member> findByNameAndPhoneAndBirth(String name, String phone, java.time.LocalDate birth);

    Optional<Member> findByEmailAndNameAndPhoneAndBirth(String email, String name, String phone, java.time.LocalDate birth);

    // 회원가입 시 사용: 이메일 중복 검사
    boolean existsByEmail(String email);

    // MyPage 초기 정보 (이름, 권한)
    @Query("""
        select new com.ilsamcheonri.hobby.dto.MemberSummaryDto(
            m.name,
            m.roleCode.roleCode
        )
        from Member m
        where m.id = :memberId
    """)
    MemberSummaryDto findSummaryById(@Param("memberId") Long memberId);

    // 계정 설정 상세 정보
    @Query("""
        select new com.ilsamcheonri.hobby.dto.MemberDetailDto(
            m.imgUrl,
            m.name,
            m.email,
            m.phone,
            m.addr,
            m.addr2
        )
        from Member m
        where m.id = :memberId
    """)
    MemberDetailDto findDetailById(@Param("memberId") Long memberId);
}
