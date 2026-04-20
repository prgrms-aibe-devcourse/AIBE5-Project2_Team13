package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.classorder.ClassOrderRequest;
import com.ilsamcheonri.hobby.dto.classorder.ClassOrderSummaryResponse;
import com.ilsamcheonri.hobby.service.ClassOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/class-orders")
@RequiredArgsConstructor
public class ClassOrderController {

    private final ClassOrderService classOrderService;

    // 클래스 상세의 "구매하기" 클릭 시 수강 신청을 생성합니다.
    @PostMapping
    public ResponseEntity<Long> applyClassOrder(
            @AuthenticationPrincipal String email,
            @RequestBody @Valid ClassOrderRequest request
    ) {
        Long orderId = classOrderService.applyClass(email, request);
        return ResponseEntity.ok(orderId);
    }

    // 로그인한 사용자의 수강 신청 목록을 조회합니다.
    @GetMapping("/me")
    public ResponseEntity<List<ClassOrderSummaryResponse>> getMyClassOrders(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(classOrderService.getMyClassOrders(email));
    }
}
