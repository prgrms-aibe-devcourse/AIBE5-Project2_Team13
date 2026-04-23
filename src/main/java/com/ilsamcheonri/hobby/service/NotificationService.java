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
 * 알림 공통 모듈.
 *
 * <p>다른 Service에서 아래 메서드를 호출해 알림을 발송합니다.</p>
 * <pre>
 *   // 1명에게 알림
 *   notificationService.send(receiverId, senderId, "ORDER_APPROVED", "메시지", "/class/1");
 *
 *   // 팔로워 전체에게 알림 (클래스 등록 시)
 *   notificationService.sendToFollowers(freelancerId, classId, classTitle);
 *
 *   // 관리자 전체에게 알림 (프리랜서 신청 시)
 *   notificationService.sendToAdmins(senderId, senderName, "FREELANCER_APPLY", "/profile");
 * </pre>
 *
 * <p><b>알림 타입 목록</b></p>
 * <ul>
 *   <li>CLASS_REGISTER   - 팔로우한 프리랜서가 클래스 등록 (수신: 팔로워)</li>
 *   <li>ORDER_APPROVED   - 수강 신청 승인 (수신: 학생)</li>
 *   <li>ORDER_REJECTED   - 수강 신청 거절 (수신: 학생)</li>
 *   <li>CLASS_COMPLETED  - 수강 완료 (수신: 학생)</li>
 *   <li>CLASS_CANCELLED  - 클래스 종료/취소 (수신: 학생)</li>
 *   <li>NEW_ORDER        - 새 수강 신청 (수신: 프리랜서)</li>
 *   <li>NEW_REVIEW       - 리뷰 등록 (수신: 프리랜서)</li>
 *   <li>FREELANCER_APPLY - 프리랜서 등록 신청 (수신: 관리자)</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MemberRepository       memberRepository;
    private final MemberFollowRepository memberFollowRepository;

    /**
     * 특정 회원 1명에게 알림을 전송합니다.
     *
     * @param receiverId  수신자 member.id
     * @param senderId    발신자 member.id
     * @param type        알림 타입 (예: ORDER_APPROVED)
     * @param content     알림 메시지
     * @param relatedLink 클릭 시 이동할 경로
     */
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

    /**
     * 프리랜서를 팔로우하는 회원 전체에게 클래스 등록 알림을 전송합니다.
     *
     * @param freelancerId 클래스를 등록한 프리랜서의 member.id
     * @param classId      등록된 클래스 ID
     * @param classTitle   등록된 클래스 제목
     */
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

    /**
     * 관리자 권한(roleCode = 'A')을 가진 모든 회원에게 알림을 전송합니다.
     * 관리자가 여러 명이어도 모두에게 발송됩니다.
     *
     * @param senderId    알림을 발생시킨 회원의 member.id
     * @param senderName  발신자 이름 (알림 메시지에 포함)
     * @param type        알림 타입
     * @param relatedLink 클릭 시 이동할 경로
     */
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

    /**
     * 로그인한 회원의 알림 목록을 최신순으로 조회합니다.
     *
     * @param email 로그인한 회원 이메일
     * @return 알림 목록 (삭제되지 않은 것만)
     */
    public List<NotificationResponse> getMyNotifications(String email) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."));

        return notificationRepository
                .findByReceiverIdAndIsDeletedFalseOrderByCreatedAtDesc(member.getId())
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    /**
     * 읽지 않은 알림 수를 반환합니다. 헤더의 빨간 뱃지 숫자 표시에 사용됩니다.
     *
     * @param email 로그인한 회원 이메일
     * @return 읽지 않은 알림 수
     */
    public long getUnreadCount(String email) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."));

        return notificationRepository.countByReceiverIdAndIsReadFalseAndIsDeletedFalse(member.getId());
    }

    /**
     * 알림 단건을 읽음 처리합니다. 본인 알림만 처리할 수 있습니다.
     *
     * @param notificationId 읽음 처리할 알림 ID
     * @param email          로그인한 회원 이메일
     */
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

    /**
     * 로그인한 회원의 읽지 않은 알림을 모두 읽음 처리합니다.
     *
     * @param email 로그인한 회원 이메일
     */
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

    /**
     * 알림 단건을 DB에서 완전히 삭제합니다 (소프트 삭제 아님).
     *
     * @param notificationId 삭제할 알림 ID
     * @param email          로그인한 회원 이메일
     */
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

    /**
     * 로그인한 회원의 알림을 전부 DB에서 완전히 삭제합니다 (소프트 삭제 아님).
     *
     * @param email 로그인한 회원 이메일
     */
    @Transactional
    public void deleteAll(String email) {

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 회원입니다."));

        List<Notification> myNotifications = notificationRepository
                .findByReceiverIdAndIsDeletedFalseOrderByCreatedAtDesc(member.getId());

        notificationRepository.deleteAll(myNotifications);
    }
}
