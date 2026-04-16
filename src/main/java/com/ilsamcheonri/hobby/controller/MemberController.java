package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.MemberInfoDto;
import com.ilsamcheonri.hobby.entity.Member;
import com.ilsamcheonri.hobby.repository.MemberRepository;
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

    @GetMapping("/me")
    public ResponseEntity<MemberInfoDto> getMyInfo(Authentication authentication) {

        String email = authentication.getName();

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("회원 없음"));

        return ResponseEntity.ok(
                new MemberInfoDto(
                        member.getId(),
                        member.getEmail(),
                        member.getName(),
                        member.getImgUrl(),
                        member.getRoleCode().getRoleCode()
                )
        );
    }
}
