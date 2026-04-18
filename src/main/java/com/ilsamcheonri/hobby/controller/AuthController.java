package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.LoginRequestDto;
import com.ilsamcheonri.hobby.dto.LoginResponseDto;
import com.ilsamcheonri.hobby.dto.MemberSignUpRequestDto;
import com.ilsamcheonri.hobby.dto.FindEmailRequestDto;
import com.ilsamcheonri.hobby.dto.FindEmailResponseDto;
import com.ilsamcheonri.hobby.dto.PasswordResetRequestDto;
import com.ilsamcheonri.hobby.dto.PasswordResetVerifyRequestDto;
import com.ilsamcheonri.hobby.dto.freelancerprofile.FreelancerProfileDetailResponse;
import com.ilsamcheonri.hobby.service.MemberService;
import com.ilsamcheonri.hobby.service.FreelancerProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final MemberService memberService;
    private final FreelancerProfileService freelancerProfileService;

    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@Valid @RequestBody MemberSignUpRequestDto dto) {
        memberService.signUp(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto dto) {
        try {
            return ResponseEntity.ok(memberService.login(dto));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of("message", ex.getReason()));
        }
    }

    @PostMapping("/find-email")
    public ResponseEntity<?> findEmail(@Valid @RequestBody FindEmailRequestDto dto) {
        try {
            FindEmailResponseDto response = memberService.findEmail(dto);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of("message", ex.getReason()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetRequestDto dto) {
        try {
            memberService.resetPassword(dto);
            return ResponseEntity.ok(Map.of("message", "비밀번호가 재설정되었습니다."));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of("message", ex.getReason()));
        }
    }

    @PostMapping("/reset-password/verify")
    public ResponseEntity<?> verifyResetPasswordIdentity(@Valid @RequestBody PasswordResetVerifyRequestDto dto) {
        try {
            memberService.verifyResetPasswordIdentity(dto);
            return ResponseEntity.ok(Map.of("message", "본인 확인이 완료되었습니다."));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of("message", ex.getReason()));
        }
    }

    @GetMapping("/freelancer-profile/{freelancerId}")
    public ResponseEntity<FreelancerProfileDetailResponse> getFreelancerProfile(
            @PathVariable Long freelancerId
    ) {
        // 프리랜서 상세 페이지는 비회원도 접근하므로 permitAll인 /api/auth/** 아래에 공개 조회 엔드포인트를 둡니다.
        return ResponseEntity.ok(freelancerProfileService.getPublicProfile(freelancerId));
    }
}
