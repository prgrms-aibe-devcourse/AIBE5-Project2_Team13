package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.dto.notification.NotificationResponse;
import com.ilsamcheonri.hobby.entity.Member;
import com.ilsamcheonri.hobby.entity.Notification;
import com.ilsamcheonri.hobby.repository.MemberFollowRepository;
import com.ilsamcheonri.hobby.repository.MemberRepository;
import com.ilsamcheonri.hobby.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * 🔔 알림 공통 모듈 (NotificationService)
 *
 * 다른 Service에서 아래처럼 호출합니다.
 *
 *   // 1명에게 알림
 *   notificationService.send(receiverId, senderId, "ORDER_APPROVED", "메시지", "/class/1");
 *
 *   // 팔로워 전체에게 알림 (클래스 등록 시)
 *   notificationService.sendToFollowers(freelancerId, classId, classTitle);
 *
 *   // 관리자 전체에게 알림 (프리랜서 신청 시)
 *   notificationService.sendToAdmins(senderId, senderName, "FREELANCER_APPLY", "/profile");
 *
 * ─────────────────────────────────────────────────────
 * 알림 타입 목록
 * CLASS_REGISTER   → 팔로우한 프리랜서가 클래스 등록 (수신: 팔로워)
 * ORDER_APPROVED   → 수강 신청 승인 (수신: 학생)
 * ORDER_REJECTED   → 수강 신청 거절 (수신: 학생)
 * CLASS_COMPLETED  → 수강 완료 (수신: 학생)
 * CLASS_CANCELLED  → 클래스 종료/취소 (수신: 학생)
 * NEW_ORDER        → 새 수강 신청 (수신: 프리랜서)
 * NEW_REVIEW       → 리뷰 등록 (수신: 프리랜서)
 * FREELANCER_APPLY → 프리랜서 등록 신청 (수신: 관리자)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MemberRepository       memberRepository;
    private final MemberFollowRepository memberFollowRepository;

    // =========================================================
    // ✅ 1. 1명에게 알림 전송
    // =========================================================
    @Transactional
    public void send(Long receiverId, Long senderId, String type, String content, String relatedLink) {

        Member receiver = memberRepository.findById(receiverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "수신자를 찾을 수 없습니다."));
        Member sender = memberRepository.findById(senderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "발신자를 찾을 수 없습니다."));

        notificationRepository.save(Notification.builder()
                .receiver(receiver)
                .sender(sender)
                .type(type)
                .content(content)
                .relatedLink(relatedLink)
                .build());
    }

    // =========================================================
    // ✅ 2. 팔로워 전체에게 알림 전송 — 클래스 등록 시
    // =========================================================
    @Transactional
    public void sendToFollowers(Long freelancerId, Long classId, String classTitle) {

        List<Long> followerIds = memberFollowRepository.findByTargetId(freelancerId)
                .stream()
                .map(follow -> follow.getFollower().getId())
                .toList();

        if (followerIds.isEmpty()) return;

        Member sender = memberRepository.findById(freelancerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "발신자를 찾을 수 없습니다."));

        String content    = "팔로우한 " + sender.getName() + "님이 '" + classTitle + "' 클래스를 등록했어요!";
        String relatedLink = "/class/" + classId;

        List<Notification> notifications = followerIds.stream()
                .flatMap(followerId -> memberRepository.findById(followerId)
                        .map(receiver -> Notification.builder()
                                .receiver(receiver)
                                .sender(sender)
                                .type("CLASS_REGISTER")
                                .content(content)
                                .relatedLink(relatedLink)
                                .build())
                        .stream())
                .toList();

        notificationRepository.saveAll(notifications);
    }

    // =========================================================
    // ✅ 3. 관리자 전체에게 알림 전송 — 프리랜서 신청 시
    // =========================================================
    @Transactional
    public void sendToAdmins(Long senderId, String senderName, String type, String relatedLink) {

        List<Member> admins = memberRepository.findByRoleCodeRoleCodeAndIsDeletedFalse("A");
        if (admins.isEmpty()) return;

        Member sender = memberRepository.findById(senderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "발신자를 찾을 수 없습니다."));

        String content = senderName + "님이 프리랜서 등록을 신청했습니다.";

        List<Notification> notifications = admins.stream()
                .map(admin -> Notification.builder()
                        .receiver(admin)
                        .sender(sender)
                        .type(type)
                        .content(content)
                        .relatedLink(relatedLink)
                        .build())
                .toList();

        notificationRepository.saveAll(notifications);
    }

    // =========================================================
    // ✅ 4. 내 알림 목록 조회
    // =========================================================
    public List<NotificationResponse> getMyNotifications(String email) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."));

        return notificationRepository
                .findByReceiverIdAndIsDeletedFalseOrderByCreatedAtDesc(member.getId())
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    // =========================================================
    // ✅ 5. 읽지 않은 알림 수 조회 — 헤더 빨간 점용
    // =========================================================
    public long getUnreadCount(String email) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."));

        return notificationRepository.countByReceiverIdAndIsReadFalseAndIsDeletedFalse(member.getId());
    }

    // =========================================================
    // ✅ 6. 단건 읽음 처리
    // =========================================================
    @Transactional
    public void markAsRead(Long notificationId, String email) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "알림을 찾을 수 없습니다."));

        if (!notification.getReceiver().getId().equals(member.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 알림만 읽음 처리할 수 있습니다.");
        }

        notification.markAsRead();
    }

    // =========================================================
    // ✅ 7. 전체 읽음 처리
    // =========================================================
    @Transactional
    public void markAllAsRead(String email) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."));

        List<Notification> unreadList = notificationRepository
                .findByReceiverIdAndIsDeletedFalseOrderByCreatedAtDesc(member.getId())
                .stream()
                .filter(n -> !n.isRead())
                .toList();

        unreadList.forEach(Notification::markAsRead);
    }

    // =========================================================
    // ✅ 8. 단건 실제 삭제 (DB에서 완전 제거)
    // =========================================================
    @Transactional
    public void delete(Long notificationId, String email) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "알림을 찾을 수 없습니다."));

        if (!notification.getReceiver().getId().equals(member.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인의 알림만 삭제할 수 있습니다.");
        }

        notificationRepository.delete(notification);
    }

    // =========================================================
    // ✅ 9. 전체 실제 삭제
    // =========================================================
    @Transactional
    public void deleteAll(String email) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."));

        List<Notification> myNotifications = notificationRepository
                .findByReceiverIdAndIsDeletedFalseOrderByCreatedAtDesc(member.getId());

        notificationRepository.deleteAll(myNotifications);
    }
}
