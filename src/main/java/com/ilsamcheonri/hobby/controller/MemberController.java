package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.MemberDetailDto;
import com.ilsamcheonri.hobby.dto.MemberInfoDto;
import com.ilsamcheonri.hobby.dto.MemberSummaryDto;
import com.ilsamcheonri.hobby.entity.Member;
import com.ilsamcheonri.hobby.repository.MemberRepository;
import com.ilsamcheonri.hobby.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberRepository memberRepository;
    private final MemberService memberService;

    // 🔹 MyPage 기본 정보
    @GetMapping("/me")
    public MemberSummaryDto getMySummary(Authentication authentication) {
        String email = authentication.getName();

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        return memberService.getMySummary(member.getId());
    }

    // 🔹 계정 설정 상세 정보
    @GetMapping("/me/detail")
    public MemberDetailDto getMyDetail(Authentication authentication) {
        String email = authentication.getName();

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        return memberService.getMyDetail(member.getId());
    }
}
