package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

// 11. 알림 (NotificationRepository.java)
public interface NotificationRepository extends JpaRepository<Notification, Long> {
}