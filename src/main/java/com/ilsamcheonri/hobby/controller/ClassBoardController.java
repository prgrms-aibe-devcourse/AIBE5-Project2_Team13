package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.classboard.ClassBoardCreateRequest;
import com.ilsamcheonri.hobby.dto.classboard.ClassBoardResponse;
import com.ilsamcheonri.hobby.service.ClassBoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
