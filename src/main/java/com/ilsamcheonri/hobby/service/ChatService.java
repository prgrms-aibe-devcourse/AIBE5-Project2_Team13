package com.ilsamcheonri.hobby.service;

import com.ilsamcheonri.hobby.config.DataInitConfig;
import com.ilsamcheonri.hobby.dto.chat.ChatDirectRoomRequestDto;
import com.ilsamcheonri.hobby.dto.chat.ChatMessageResponseDto;
import com.ilsamcheonri.hobby.dto.chat.ChatRoomListItemDto;
import com.ilsamcheonri.hobby.dto.chat.ChatRoomResponseDto;
import com.ilsamcheonri.hobby.entity.ChatMessage;
import com.ilsamcheonri.hobby.entity.ChatParticipant;
import com.ilsamcheonri.hobby.entity.ChatRoom;
import com.ilsamcheonri.hobby.entity.Member;
import com.ilsamcheonri.hobby.repository.ChatMessageRepository;
import com.ilsamcheonri.hobby.repository.ChatParticipantRepository;
import com.ilsamcheonri.hobby.repository.ChatRoomRepository;
import com.ilsamcheonri.hobby.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final MemberRepository memberRepository;

    // 1:1 채팅 시작 시 기존 방이 있으면 재사용하고, 없으면 새로 만듭니다.
    @Transactional
    public ChatRoomResponseDto createOrOpenDirectRoom(String currentEmail, ChatDirectRoomRequestDto request) {
        Member currentMember = getActiveMemberByEmail(currentEmail);
        Member targetMember = resolveTargetMember(request);

        if (currentMember.getId().equals(targetMember.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "본인과는 채팅을 시작할 수 없습니다.");
        }

        ChatRoom chatRoom = findExistingDirectRoom(currentMember.getId(), targetMember.getId())
                .map(existingRoom -> restoreDirectRoomParticipants(existingRoom.getId(), currentMember.getId(), targetMember.getId()))
                .orElseGet(() -> createDirectRoom(currentMember, targetMember));

        return toRoomResponse(chatRoom, currentMember.getId(), targetMember);
    }

    // 채팅방 목록 화면에서 최근 메시지와 unread 개수를 함께 보여주기 위한 조회입니다.
    public List<ChatRoomListItemDto> getMyRooms(String currentEmail) {
        Member currentMember = getActiveMemberByEmail(currentEmail);

        return chatParticipantRepository.findActiveRoomParticipantsByMemberId(currentMember.getId()).stream()
                .map(participant -> {
                    ChatRoom room = participant.getChatRoom();
                    Member otherMember = loadOtherMember(room, currentMember.getId());
                    LocalDateTime lastClearedAt = participant.getLastClearedAt();
                    String visibleLastMessage = isMessageVisibleAfterClear(room.getLastMessageAt(), lastClearedAt)
                            ? room.getLastMessage()
                            : null;
                    LocalDateTime visibleLastMessageAt = isMessageVisibleAfterClear(room.getLastMessageAt(), lastClearedAt)
                            ? room.getLastMessageAt()
                            : null;
                    return new ChatRoomListItemDto(
                            room.getId(),
                            otherMember.getId(),
                            otherMember.getName(),
                            otherMember.getRoleCode().getRoleCode(),
                            otherMember.getEmail(),
                            otherMember.getImgUrl(),
                            visibleLastMessage,
                            visibleLastMessageAt,
                            chatMessageRepository.countUnreadMessages(room.getId(), currentMember.getId(), lastClearedAt)
                    );
                })
                .toList();
    }

    // 방 입장 시 전체 이력을 오래된 순으로 내려줍니다.
    public List<ChatMessageResponseDto> getRoomMessages(String currentEmail, Long roomId) {
        Member currentMember = getActiveMemberByEmail(currentEmail);
        ChatParticipant participant = ensureParticipant(roomId, currentMember.getId());

        return chatMessageRepository.findVisibleMessagesByRoomId(roomId, participant.getLastClearedAt()).stream()
                .map(this::toMessageResponse)
                .toList();
    }

    // 쉬운 읽음 처리 버전: 방을 열면 상대가 보낸 unread 메시지를 모두 읽음으로 바꿉니다.
    @Transactional
    public void markRoomAsRead(String currentEmail, Long roomId) {
        Member currentMember = getActiveMemberByEmail(currentEmail);
        ChatParticipant participant = ensureParticipant(roomId, currentMember.getId());

        List<ChatMessage> unreadMessages = chatMessageRepository.findUnreadMessagesByRoomIdAndReaderId(
                roomId,
                currentMember.getId(),
                participant.getLastClearedAt()
        );
        unreadMessages.forEach(ChatMessage::markAsRead);
    }

    // 채팅방 나가기는 방 자체를 지우지 않고, 현재 사용자 participant만 soft delete 처리합니다.
    @Transactional
    public void leaveRoom(String currentEmail, Long roomId) {
        Member currentMember = getActiveMemberByEmail(currentEmail);
        ChatParticipant participant = ensureParticipant(roomId, currentMember.getId());
        participant.leaveRoom();
    }

    // WebSocket으로 들어온 새 메시지를 저장하고 채팅방 최근 메시지 메타데이터도 함께 갱신합니다.
    @Transactional
    public ChatMessageResponseDto sendMessage(String currentEmail, Long roomId, String rawMessage) {
        Member currentMember = getActiveMemberByEmail(currentEmail);
        ChatRoom chatRoom = ensureParticipant(roomId, currentMember.getId()).getChatRoom();

        String message = rawMessage == null ? "" : rawMessage.trim();
        if (message.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "메시지를 입력해주세요.");
        }

        // 상대가 이 방을 나간 상태여도, 남아 있는 쪽이 실제 메시지를 보내면 상대 participant를 복구해 채팅방을 재활성화합니다.
        restoreOtherParticipantIfLeft(chatRoom, currentMember.getId());

        ChatMessage savedMessage = chatMessageRepository.saveAndFlush(
                ChatMessage.builder()
                        .chatRoom(chatRoom)
                        .sender(currentMember)
                        .message(message)
                        .build()
        );

        LocalDateTime sentAt = savedMessage.getSentAt() == null ? LocalDateTime.now() : savedMessage.getSentAt();
        chatRoom.updateLastMessage(message, sentAt);

        return toMessageResponse(savedMessage);
    }

    // 특정 방 참여자 전체 이메일을 찾아 양쪽 브라우저 세션에 동시에 push 합니다.
    public List<String> getParticipantEmails(Long roomId) {
        return chatParticipantRepository.findByChatRoomIdAndIsDeletedFalse(roomId).stream()
                .map(participant -> participant.getMember().getEmail())
                .toList();
    }

    // targetMemberId 일반 문의와 관리자 문의를 하나의 로직에서 처리합니다.
    // 관리자 문의일 때는 DTO에 이메일을 직접 실어 보내지 않고 DataInitConfig의 단일 상수를 사용합니다.
    private Member resolveTargetMember(ChatDirectRoomRequestDto request) {
        if (request.getTargetMemberId() != null) {
            return memberRepository.findById(request.getTargetMemberId())
                    .filter(member -> !member.isDeleted())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅 대상을 찾을 수 없습니다."));
        }

        if (request.isAdminInquiry()) {
            // 관리자 문의의 실제 대상은 애플리케이션 전역 기준값(DataInitConfig.ADMIN_CHAT_EMAIL)으로 고정합니다.
            return getActiveMemberByEmail(DataInitConfig.ADMIN_CHAT_EMAIL);
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "채팅 대상 정보가 필요합니다.");
    }

    // 채팅은 탈퇴하지 않은 회원끼리만 생성/조회되도록 활성 회원만 허용합니다.
    private Member getActiveMemberByEmail(String email) {
        return memberRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 정보를 찾을 수 없습니다."));
    }

    // 두 참가자가 모두 살아있는 방이 있으면 그 방을 재사용합니다.
    private java.util.Optional<ChatRoom> findExistingDirectRoom(Long memberAId, Long memberBId) {
        return chatParticipantRepository.findDirectRoomIdsByMemberPair(memberAId, memberBId).stream()
                .map(chatRoomRepository::findByIdAndIsDeletedFalse)
                .flatMap(java.util.Optional::stream)
                .max(Comparator.comparing(ChatRoom::getId));
    }

    // 아직 방이 없을 때만 새 1:1 채팅방과 두 참여자를 함께 생성합니다.
    private ChatRoom createDirectRoom(Member currentMember, Member targetMember) {
        ChatRoom chatRoom = chatRoomRepository.save(ChatRoom.builder().build());

        chatParticipantRepository.save(ChatParticipant.builder()
                .member(currentMember)
                .chatRoom(chatRoom)
                .build());
        chatParticipantRepository.save(ChatParticipant.builder()
                .member(targetMember)
                .chatRoom(chatRoom)
                .build());

        return chatRoom;
    }

    // 예전에 나간 적 있는 방으로 다시 문의가 들어오면 두 participant를 복구해 기존 이력을 이어갑니다.
    private ChatRoom restoreDirectRoomParticipants(Long roomId, Long memberAId, Long memberBId) {
        ChatRoom chatRoom = chatRoomRepository.findByIdAndIsDeletedFalse(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방을 찾을 수 없습니다."));

        restoreParticipant(roomId, memberAId);
        restoreParticipant(roomId, memberBId);

        return chatRoom;
    }

    // 메시지 조회/읽음/전송 전에는 항상 현재 사용자가 그 방 참여자인지 검증합니다.
    private ChatParticipant ensureParticipant(Long roomId, Long memberId) {
        return chatParticipantRepository.findByChatRoomIdAndMemberIdAndIsDeletedFalse(roomId, memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "채팅방에 접근할 수 없습니다."));
    }

    // soft delete 된 참여자를 기존 방 재사용 시 다시 활성화합니다.
    private void restoreParticipant(Long roomId, Long memberId) {
        ChatParticipant participant = chatParticipantRepository.findByChatRoomIdAndMemberId(roomId, memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅 참여자 정보를 찾을 수 없습니다."));

        if (participant.isDeleted()) {
            participant.restoreRoom();
        }
    }

    // 채팅방 목록과 헤더에 보여줄 상대방 한 명을 찾습니다.
    private Member loadOtherMember(ChatRoom room, Long currentMemberId) {
        return chatParticipantRepository.findOtherMemberByRoomAndMemberId(room, currentMemberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "상대방 정보를 찾을 수 없습니다."));
    }

    // 방 생성 직후에도 목록 화면과 같은 모양의 데이터를 바로 쓸 수 있게 맞춥니다.
    private ChatRoomResponseDto toRoomResponse(ChatRoom room, Long currentMemberId, Member targetMember) {
        Member otherMember = targetMember != null ? targetMember : loadOtherMember(room, currentMemberId);
        LocalDateTime lastClearedAt = chatParticipantRepository.findByChatRoomIdAndMemberId(room.getId(), currentMemberId)
                .map(ChatParticipant::getLastClearedAt)
                .orElse(null);

        return new ChatRoomResponseDto(
                room.getId(),
                otherMember.getId(),
                otherMember.getName(),
                otherMember.getRoleCode().getRoleCode(),
                otherMember.getEmail(),
                otherMember.getImgUrl(),
                isMessageVisibleAfterClear(room.getLastMessageAt(), lastClearedAt) ? room.getLastMessage() : null,
                isMessageVisibleAfterClear(room.getLastMessageAt(), lastClearedAt) ? room.getLastMessageAt() : null,
                chatMessageRepository.countUnreadMessages(
                        room.getId(),
                        currentMemberId,
                        lastClearedAt
                )
        );
    }

    // 마지막 메시지 시각이 lastClearedAt 이전이면, 재입장 사용자에게는 목록 미리보기에도 노출하지 않습니다.
    private boolean isMessageVisibleAfterClear(LocalDateTime messageTime, LocalDateTime lastClearedAt) {
        return messageTime != null && (lastClearedAt == null || messageTime.isAfter(lastClearedAt));
    }

    // 한쪽만 방을 나간 상태에서 남아 있는 사용자가 메시지를 보내면 상대방 방도 자동으로 복구시킵니다.
    private void restoreOtherParticipantIfLeft(ChatRoom room, Long currentMemberId) {
        chatParticipantRepository.findOtherParticipantByRoomAndMemberId(room, currentMemberId)
                .filter(ChatParticipant::isDeleted)
                .ifPresent(ChatParticipant::restoreRoom);
    }

    // 엔티티를 프론트 공통 메시지 응답 형태로 변환합니다.
    private ChatMessageResponseDto toMessageResponse(ChatMessage message) {
        return new ChatMessageResponseDto(
                message.getId(),
                message.getChatRoom().getId(),
                message.getSender().getId(),
                message.getSender().getName(),
                message.getSender().getEmail(),
                message.getMessage(),
                message.isRead(),
                message.getSentAt()
        );
    }
}
