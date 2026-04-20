package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// 13. 채팅방 (ChatRoomRepository.java)
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    // 삭제되지 않은 채팅방만 실제 채팅 화면에서 사용합니다.
    Optional<ChatRoom> findByIdAndIsDeletedFalse(Long roomId);
}
