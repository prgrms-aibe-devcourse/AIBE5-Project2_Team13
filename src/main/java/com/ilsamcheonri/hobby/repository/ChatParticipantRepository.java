package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

// 14. 채팅 참여자 (ChatParticipantRepository.java)
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {
}