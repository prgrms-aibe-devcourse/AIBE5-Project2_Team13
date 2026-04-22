package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 11. 알림 (NotificationRepository.java)
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** 내 알림 목록 — 최신순, 삭제 안 된 것만 */
    List<Notification> findByReceiverIdAndIsDeletedFalseOrderByCreatedAtDesc(Long receiverId);

    /** 읽지 않은 알림 수 — 헤더 빨간 점 표시용 */
    long countByReceiverIdAndIsReadFalseAndIsDeletedFalse(Long receiverId);
}