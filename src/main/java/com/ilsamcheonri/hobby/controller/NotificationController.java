package com.ilsamcheonri.hobby.controller;

import com.ilsamcheonri.hobby.dto.notification.NotificationResponse;
import com.ilsamcheonri.hobby.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 🔔 알림 API 엔드포인트
 * <pre>
 * GET    /api/notifications              → 내 알림 목록
 * GET    /api/notifications/unread       → 읽지 않은 알림 수 (헤더 빨간 점)
 * PATCH  /api/notifications/{id}/read   → 단건 읽음 처리
 * PATCH  /api/notifications/read-all    → 전체 읽음 처리
 * DELETE /api/notifications/{id}        → 단건 실제 삭제
 * DELETE /api/notifications             → 전체 실제 삭제
 * <pre/>
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /** 내 알림 목록 조회 */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(notificationService.getMyNotifications(email));
    }

    /** 읽지 않은 알림 수 — 헤더 빨간 점 표시용 */
    @GetMapping("/unread")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal String email
    ) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(email)));
    }

    /** 단건 읽음 처리 — 알림 클릭 시 호출 */
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal String email
    ) {
        notificationService.markAsRead(notificationId, email);
        return ResponseEntity.noContent().build();
    }

    /** 전체 읽음 처리 — "모두 읽음" 버튼 클릭 시 호출 */
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal String email
    ) {
        notificationService.markAllAsRead(email);
        return ResponseEntity.noContent().build();
    }

    /** 단건 실제 삭제 — X 버튼 클릭 시 호출 */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal String email
    ) {
        notificationService.delete(notificationId, email);
        return ResponseEntity.noContent().build(); // 204
    }

    /** 전체 실제 삭제 — 휴지통 버튼 클릭 시 호출 */
    @DeleteMapping
    public ResponseEntity<Void> deleteAll(
            @AuthenticationPrincipal String email
    ) {
        notificationService.deleteAll(email);
        return ResponseEntity.noContent().build(); // 204
    }
}
