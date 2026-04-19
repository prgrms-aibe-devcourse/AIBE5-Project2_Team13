package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.classboard.ClassBoardCreateRequest;
import com.ilsamcheonri.hobby.dto.classboard.ClassBoardResponse;
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

    @GetMapping
    public ResponseEntity<List<ClassBoardResponse>> getClassList() {
        return ResponseEntity.ok(classBoardService.getOfferClassList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassBoardResponse> getClass(@PathVariable Long id) {
        return ResponseEntity.ok(classBoardService.getOfferClass(id));
    }

    @PostMapping
    public ResponseEntity<Long> createClass(
            @RequestBody @Valid ClassBoardCreateRequest request,
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(classBoardService.createOfferClass(email, request));
    }

    @PutMapping("/{id}")
    // 클래스 수정 요청을 처리하는 API
    public ResponseEntity<Long> updateClass(
            @PathVariable Long id,
            @RequestBody @Valid ClassBoardCreateRequest request,  // 또는 별도의 수정용 DTO
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(classBoardService.updateOfferClass(email, id, request));
    }

    @DeleteMapping("/{id}")
    // 클래스 삭제 요청을 처리하는 API
    public ResponseEntity<Void> deleteClass(
            @PathVariable Long id,
            @AuthenticationPrincipal String email
    ) {
        classBoardService.deleteOfferClass(email, id);
        return ResponseEntity.ok().build();
    }

    /**
     * 클래스 모집 상태 토글 (OPEN <-> CLOSE)
     */
    @PatchMapping("/{id}/status")
    // 클래스 모집 상태 전환 요청을 처리하는 API
    public ResponseEntity<String> toggleStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal String email
    ) {
        String nextStatus = classBoardService.toggleStatus(email, id);
        return ResponseEntity.ok(nextStatus);
    }

}
