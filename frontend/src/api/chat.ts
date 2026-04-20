import apiClient from './axios';

export type ChatRoomSummary = {
  // 좌측 채팅방 리스트에서 바로 쓸 수 있도록 서버 응답 구조를 그대로 정의합니다.
  roomId: number;
  otherMemberId: number;
  otherMemberName: string;
  otherMemberRole: string;
  otherMemberEmail: string;
  otherMemberImgUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type ChatMessage = {
  // 채팅 이력 조회와 실시간 신규 메시지 이벤트에 공통으로 쓰는 타입입니다.
  messageId: number;
  roomId: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  message: string;
  read: boolean;
  sentAt: string;
};

export type CreateDirectChatRequest = {
  // 일반 문의는 회원 PK 기반으로 시작합니다.
  targetMemberId?: number;
  // 관리자 문의는 이메일 문자열을 프론트가 직접 알 필요가 없도록 의도만 boolean으로 보냅니다.
  // footer 문의는 "관리자 채팅을 열어달라"는 의도만 보내고, 실제 이메일은 백엔드가 고정합니다.
  adminInquiry?: boolean;
};

// 문의 버튼에서 눌렀을 때 기존 방이 있으면 재사용, 없으면 새 방을 만듭니다.
export const createOrOpenDirectChatRoom = async (
  payload: CreateDirectChatRequest,
): Promise<ChatRoomSummary> => {
  const res = await apiClient.post('/chat/rooms/direct', payload);
  return res.data;
};

// 좌측 채팅방 목록과 최근 메시지/unread badge 데이터 조회입니다.
export const getChatRooms = async (): Promise<ChatRoomSummary[]> => {
  const res = await apiClient.get('/chat/rooms');
  return res.data;
};

// 현재 방의 전체 메시지 이력을 조회합니다.
export const getChatMessages = async (roomId: number): Promise<ChatMessage[]> => {
  const res = await apiClient.get(`/chat/rooms/${roomId}/messages`);
  return res.data;
};

// 방에 들어온 시점의 unread 메시지를 읽음 처리합니다.
export const markChatRoomAsRead = async (roomId: number): Promise<void> => {
  await apiClient.post(`/chat/rooms/${roomId}/read`);
};

// 채팅방 나가기는 현재 사용자 participant만 soft delete 해서 내 목록에서 숨깁니다.
export const leaveChatRoom = async (roomId: number): Promise<void> => {
  await apiClient.post(`/chat/rooms/${roomId}/leave`);
};
