package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

// 13. 채팅방 (ChatRoomRepository.java)
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
}