package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.classorder.ClassOrderRequest;
import com.ilsamcheonri.hobby.dto.classorder.ClassOrderSummaryResponse;
import com.ilsamcheonri.hobby.service.ClassOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    // [기능: 수강 신청 생성 API] [이유: 클래스 상세 페이지에서 회원의 수강 신청을 저장하기 위해]
    @PostMapping
    public ResponseEntity<Long> applyClassOrder(
            @AuthenticationPrincipal String email,
            @RequestBody @Valid ClassOrderRequest request
    ) {
        Long orderId = classOrderService.applyClass(email, request);
        return ResponseEntity.ok(orderId);
    }

    // [기능: 학생 본인 수강 신청 목록 조회 API] [이유: 마이페이지 수강 관리 탭에서 본인 신청 이력을 불러오기 위해]
    @GetMapping("/me")
    public ResponseEntity<List<ClassOrderSummaryResponse>> getMyClassOrders(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(classOrderService.getMyClassOrders(email));
    }

    // [기능: 프리랜서 본인 클래스 신청 내역 조회 API] [이유: 마이페이지 수강생 관리 탭에서 실제 신청 데이터를 불러오기 위해]
    @GetMapping("/freelancer/me")
    public ResponseEntity<List<ClassOrderSummaryResponse>> getFreelancerClassOrders(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(classOrderService.getFreelancerClassOrders(email));
    }

    // [기능: 프리랜서 수강 신청 승인 API] [이유: 수강생 관리 탭에서 승인 버튼으로 신청 상태를 APPROVED/IN_PROGRESS로 변경하기 위해]
    @GetMapping("/admin")
    public ResponseEntity<List<ClassOrderSummaryResponse>> getAdminClassOrders(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(classOrderService.getAdminClassOrders(email));
    }

    @PatchMapping("/{orderId}/approve")
    public ResponseEntity<Void> approveClassOrder(
            @AuthenticationPrincipal String email,
            @PathVariable Long orderId
    ) {
        classOrderService.approveClassOrder(email, orderId);
        return ResponseEntity.ok().build();
    }

    // [기능: 프리랜서 수강 신청 거절 API] [이유: 수강생 관리 탭에서 거절 버튼으로 신청 상태를 REJECTED/REJECTED로 변경하기 위해]
    @PatchMapping("/{orderId}/reject")
    public ResponseEntity<Void> rejectClassOrder(
            @AuthenticationPrincipal String email,
            @PathVariable Long orderId
    ) {
        classOrderService.rejectClassOrder(email, orderId);
        return ResponseEntity.ok().build();
    }

    // [기능: 수강 신청 취소 API] [이유: 학생이 마이페이지에서 본인 신청을 취소할 수 있게 하기 위해]
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelClassOrder(
            @AuthenticationPrincipal String email,
            @PathVariable Long orderId
    ) {
        classOrderService.cancelClassOrder(email, orderId);
        return ResponseEntity.ok().build();
    }
}
