package com.ilsamcheonri.hobby.repository;

import com.ilsamcheonri.hobby.entity.ChatParticipant;
import com.ilsamcheonri.hobby.entity.ChatRoom;
import com.ilsamcheonri.hobby.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

// 14. 채팅 참여자 (ChatParticipantRepository.java)
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {
    // 내 채팅방 목록을 만들 때 사용합니다.
    List<ChatParticipant> findByMemberIdAndIsDeletedFalse(Long memberId);

    // 현재 방의 참여자를 모두 찾아 WebSocket 브로드캐스트 대상에 사용합니다.
    List<ChatParticipant> findByChatRoomIdAndIsDeletedFalse(Long roomId);

    // 사용자가 해당 방 참여자인지 검증할 때 사용합니다.
    Optional<ChatParticipant> findByChatRoomIdAndMemberIdAndIsDeletedFalse(Long roomId, Long memberId);

    // 나가기 후 재문의 시에는 soft delete 된 참여자도 다시 찾아 복구해야 하므로 삭제 여부와 무관한 조회가 필요합니다.
    Optional<ChatParticipant> findByChatRoomIdAndMemberId(Long roomId, Long memberId);

    // 1:1 채팅은 현재 활성/비활성 상태와 무관하게 같은 두 사람이 엮인 기존 방을 찾아 재사용 기준으로 삼습니다.
    @Query("""
        select cp.chatRoom.id
        from ChatParticipant cp
        where cp.chatRoom.isDeleted = false
          and cp.member.id in (:memberAId, :memberBId)
        group by cp.chatRoom.id
        having count(distinct cp.member.id) = 2 and count(cp.id) = 2
    """)
    List<Long> findDirectRoomIdsByMemberPair(
            @Param("memberAId") Long memberAId,
            @Param("memberBId") Long memberBId
    );

    // 채팅방 목록은 최근 메시지 시간 기준으로 정렬된 상태로 조회합니다.
    @Query("""
        select cp
        from ChatParticipant cp
        join fetch cp.chatRoom room
        where cp.member.id = :memberId
          and cp.isDeleted = false
          and room.isDeleted = false
        order by coalesce(room.lastMessageAt, room.updatedAt) desc, room.id desc
    """)
    List<ChatParticipant> findActiveRoomParticipantsByMemberId(@Param("memberId") Long memberId);

    // 채팅방 목록과 헤더에 표시할 상대방 정보를 찾습니다.
    // 여기서는 상대 participant의 isDeleted 여부를 보지 않습니다.
    // 이유:
    // - 방 나가기는 "내 목록에서만 숨김"이어야 하고,
    // - 상대방 입장에서는 내가 나갔더라도 기존 대화방과 상대 정보가 계속 보여야 하기 때문입니다.
    @Query("""
        select cp.member
        from ChatParticipant cp
        where cp.chatRoom = :chatRoom
          and cp.member.id <> :memberId
    """)
    Optional<Member> findOtherMemberByRoomAndMemberId(
            @Param("chatRoom") ChatRoom chatRoom,
            @Param("memberId") Long memberId
    );

    // 상대방이 방을 나갔는지 확인하려면 participant 엔티티 자체가 필요하므로 별도 조회를 둡니다.
    @Query("""
        select cp
        from ChatParticipant cp
        where cp.chatRoom = :chatRoom
          and cp.member.id <> :memberId
    """)
    Optional<ChatParticipant> findOtherParticipantByRoomAndMemberId(
            @Param("chatRoom") ChatRoom chatRoom,
            @Param("memberId") Long memberId
    );
}
