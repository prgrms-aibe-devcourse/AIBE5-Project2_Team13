package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.LoginRequestDto;
import com.ilsamcheonri.hobby.dto.LoginResponseDto;
import com.ilsamcheonri.hobby.dto.MemberSignUpRequestDto;
import com.ilsamcheonri.hobby.dto.FindEmailRequestDto;
import com.ilsamcheonri.hobby.dto.FindEmailResponseDto;
import com.ilsamcheonri.hobby.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
}
