package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.LoginRequestDto;
import com.ilsamcheonri.hobby.dto.LoginResponseDto;
import com.ilsamcheonri.hobby.dto.MemberSignUpRequestDto;
import com.ilsamcheonri.hobby.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto dto) {
        return ResponseEntity.ok(memberService.login(dto));
    }
}
