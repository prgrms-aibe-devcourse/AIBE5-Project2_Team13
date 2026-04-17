package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.AdminMemberListItemDto;
import com.ilsamcheonri.hobby.dto.MemberDetailDto;
import com.ilsamcheonri.hobby.dto.MemberPasswordUpdateRequestDto;
import com.ilsamcheonri.hobby.dto.MemberRoleUpdateRequestDto;
import com.ilsamcheonri.hobby.dto.MemberSummaryDto;
import com.ilsamcheonri.hobby.dto.MemberUpdateRequestDto;
import com.ilsamcheonri.hobby.entity.Member;
import com.ilsamcheonri.hobby.repository.MemberRepository;
import com.ilsamcheonri.hobby.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.List;

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

    @GetMapping("/admin/users")
    public ResponseEntity<List<AdminMemberListItemDto>> getAdminMembers(Authentication authentication) {
        return ResponseEntity.ok(memberService.getAdminMembers(authentication.getName()));
    }

    @PutMapping("/me/detail")
    public ResponseEntity<MemberDetailDto> updateMyDetail(
            Authentication authentication,
            @Valid @RequestBody MemberUpdateRequestDto request
    ) {
        return ResponseEntity.ok(memberService.updateMyDetail(authentication.getName(), request));
    }

    @PatchMapping("/me/withdraw")
    public ResponseEntity<?> withdrawMyAccount(Authentication authentication) {
        try {
            memberService.withdrawMyAccount(authentication.getName());
            return ResponseEntity.ok().build();
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of("message", ex.getReason()));
        }
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> updateMyPassword(
            Authentication authentication,
            @Valid @RequestBody MemberPasswordUpdateRequestDto request
    ) {
        try {
            memberService.updateMyPassword(authentication.getName(), request);
            return ResponseEntity.ok().build();
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of("message", ex.getReason()));
        }
    }

    @PutMapping("/admin/users/{memberId}/role")
    public ResponseEntity<?> updateMemberRole(
            Authentication authentication,
            @PathVariable Long memberId,
            @Valid @RequestBody MemberRoleUpdateRequestDto request
    ) {
        try {
            return ResponseEntity.ok(memberService.updateMemberRole(authentication.getName(), memberId, request));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of("message", ex.getReason()));
        }
    }

    @PatchMapping("/admin/users/{memberId}/withdraw")
    public ResponseEntity<?> toggleMemberDeleted(
            Authentication authentication,
            @PathVariable Long memberId
    ) {
        try {
            return ResponseEntity.ok(memberService.toggleMemberDeleted(authentication.getName(), memberId));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of("message", ex.getReason()));
        }
    }
}
