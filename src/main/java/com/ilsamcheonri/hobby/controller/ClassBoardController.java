package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.classboard.ClassBoardCreateRequest;
import com.ilsamcheonri.hobby.dto.classboard.ClassBoardResponse;
import com.ilsamcheonri.hobby.dto.classboard.ClassDetailResponse;
import com.ilsamcheonri.hobby.service.ClassBoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
public class ClassBoardController {

    private final ClassBoardService classBoardService;

    // 전체 클래스 목록 조회
    @GetMapping
    public ResponseEntity<List<ClassBoardResponse>> getClassList() {
        return ResponseEntity.ok(classBoardService.getOfferClassList());
    }

    // 특정 클래스 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<ClassDetailResponse> getClass(@PathVariable Long id) {
        return ResponseEntity.ok(classBoardService.getDetails(id));
    }

    // 클래스 등록
    @PostMapping
    public ResponseEntity<Long> createClass(
            @ModelAttribute @Valid ClassBoardCreateRequest request,
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(classBoardService.createOfferClass(email, request));
    }

    // 클래스 정보 수정
    @PutMapping("/{id}")
    public ResponseEntity<Long> updateClass(
            @PathVariable Long id,
            @ModelAttribute @Valid ClassBoardCreateRequest request,
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(classBoardService.updateOfferClass(email, id, request));
    }

    // 클래스 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(
            @PathVariable Long id,
            @AuthenticationPrincipal String email
    ) {
        classBoardService.deleteOfferClass(email, id);
        return ResponseEntity.ok().build();
    }

    // 클래스 모집 상태 토글 (OPEN <-> CLOSE)
    @PatchMapping("/{id}/status")
    public ResponseEntity<String> toggleStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal String email
    ) {
        String nextStatus = classBoardService.toggleStatus(email, id);
        return ResponseEntity.ok(nextStatus);
    }
}