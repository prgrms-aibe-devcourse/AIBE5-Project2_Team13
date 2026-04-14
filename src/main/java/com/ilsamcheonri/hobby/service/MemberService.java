package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.MemberSignUpRequestDto;
import com.ilsamcheonri.hobby.entity.Member;
import com.ilsamcheonri.hobby.entity.RoleCode;
import com.ilsamcheonri.hobby.repository.MemberRepository;
import com.ilsamcheonri.hobby.repository.RoleCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;
    private final RoleCodeRepository roleCodeRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Long signUp(MemberSignUpRequestDto requestDto) {

        // 1. 이메일 중복 검사 (비즈니스 규칙 검증)
        if (memberRepository.existsByEmail(requestDto.getEmail())) {
            throw new IllegalStateException("이미 가입된 이메일입니다.");
        }

        // 2. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(requestDto.getPassword());

        // 3. 회원가입 기본 권한('U') 조회
        RoleCode userRole = roleCodeRepository.findByRoleCode("U");
        if (userRole == null) {
            throw new IllegalStateException("기본 권한을 찾을 수 없습니다.");
        }

        // 4. DTO -> Entity 변환
        Member member = Member.builder()
                .email(requestDto.getEmail())
                .password(encodedPassword)
                .name(requestDto.getName())
                .birth(requestDto.getBirth())
                .phone(requestDto.getPhone())
                .addr(requestDto.getAddr())
                .roleCode(userRole)
                .build();

        // 5. DB 저장
        Member savedMember = memberRepository.save(member);
        return savedMember.getId();
    }
}