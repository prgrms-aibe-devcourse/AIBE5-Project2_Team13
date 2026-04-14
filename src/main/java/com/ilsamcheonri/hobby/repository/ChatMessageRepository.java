package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

// 15. 채팅 메시지 (ChatMessageRepository.java)
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
}