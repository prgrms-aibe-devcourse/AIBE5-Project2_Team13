package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.*;
import com.ilsamcheonri.hobby.entity.Member;
import com.ilsamcheonri.hobby.entity.RoleCode;
import com.ilsamcheonri.hobby.jwt.JwtTokenProvider;
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

    private final JwtTokenProvider jwtTokenProvider;

    private final MemberRepository memberRepository;
    private final RoleCodeRepository roleCodeRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Long signUp(MemberSignUpRequestDto dto) {

        if (memberRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalStateException("이미 가입된 이메일입니다.");
        }

        String encodedPassword = passwordEncoder.encode(dto.getPassword());

        RoleCode role = roleCodeRepository.findByRoleCode("U")
                .orElseThrow(() -> new IllegalStateException("기본 권한을 찾을 수 없습니다."));

        Member member = Member.builder()
                .email(dto.getEmail())
                .password(encodedPassword)
                .name(dto.getName())
                .birth(dto.getBirth())
                .phone(dto.getPhone())
                .addr(dto.getAddr())
                .addr2(dto.getAddr2())
                .roleCode(role)
                .build();

        return memberRepository.save(member).getId();
    }


    public LoginResponseDto login(LoginRequestDto dto) {
        System.out.println("LOGIN METHOD CALLED");
        Member member = memberRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이메일입니다."));
        System.out.println("AFTER FIND MEMBER");
        if (!passwordEncoder.matches(dto.getPassword(), member.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        System.out.println("LOGIN SUCCESS");

        String accessToken = jwtTokenProvider.createAccessToken(member.getEmail());
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getEmail());

        return new LoginResponseDto(accessToken, refreshToken);
    }

    // MyPage 첫 화면
    public MemberSummaryDto getMySummary(Long memberId) {
        return memberRepository.findSummaryById(memberId);
    }

    // 계정 설정 화면
    public MemberDetailDto getMyDetail(Long memberId) {
        return memberRepository.findDetailById(memberId);
    }

}