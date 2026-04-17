package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.classboard.ClassBoardResponse;
import com.ilsamcheonri.hobby.service.ClassBoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
}
