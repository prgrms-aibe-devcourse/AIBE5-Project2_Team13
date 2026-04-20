import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronUp, MessageCircle, Search, Send, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/context/AuthContext';
import { getAccessToken } from '@/src/lib/auth';
import {
  createOrOpenDirectChatRoom,
  getChatMessages,
  getChatRooms,
  leaveChatRoom,
  markChatRoomAsRead,
  type ChatMessage,
  type ChatRoomSummary,
} from '@/src/api/chat';

type ChatSocketEvent =
  | {
      // 서버가 새 메시지 저장 후 브라우저에 보내는 실시간 이벤트입니다.
      type: 'MESSAGE_CREATED';
      payload: ChatMessage;
    }
  | {
      // WebSocket 처리 중 사용자에게 바로 보여줄 오류 이벤트입니다.
      type: 'ERROR';
      message: string;
    };

// 채팅방 목록은 오늘이면 시:분, 아니면 월/일만 보여 카카오톡 느낌으로 정리합니다.
const formatRoomTime = (value: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
};

// 메시지 말풍선 아래 시간 표시는 시:분까지만 사용합니다.
const formatMessageTime = (value: string) =>
  new Date(value).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 개발 환경에서는 Vite 프록시(/ws -> 8080)를 타도록 브라우저 origin 기준으로 WebSocket 주소를 만듭니다.
const buildWebSocketUrl = (token: string) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/chat?token=${encodeURIComponent(token)}`;
};

export default function Chat() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoggedIn, loading } = useAuth();
  const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [roomLoading, setRoomLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [leavingRoom, setLeavingRoom] = useState(false);
  const [isMessageSearchOpen, setIsMessageSearchOpen] = useState(false);
  const [messageSearchKeyword, setMessageSearchKeyword] = useState('');
  const [activeSearchMatchIndex, setActiveSearchMatchIndex] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const selectedRoomIdRef = useRef<number | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const messageSearchInputRef = useRef<HTMLInputElement>(null);
  const messageItemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const resolvedTargetKeyRef = useRef<string | null>(null);
  const shouldForceScrollToBottomRef = useRef(false);

  const scrollMessageListToBottom = (behavior: ScrollBehavior) => {
    const messageListElement = messageListRef.current;
    if (!messageListElement) {
      return;
    }

    messageListElement.scrollTo({
      top: messageListElement.scrollHeight,
      behavior,
    });
  };

  const syncHeaderUnreadIndicator = (nextRooms: ChatRoomSummary[]) => {
    // 헤더 채팅 점은 unread가 남아 있는 방이 하나라도 있는지만 보면 되므로, 채팅 페이지에서 즉시 이벤트로 동기화합니다.
    window.dispatchEvent(
      new CustomEvent('chat-unread-updated', {
        detail: {
          hasUnread: nextRooms.some((room) => room.unreadCount > 0),
        },
      }),
    );
  };

  // WebSocket 이벤트 핸들러 안에서도 최신 선택 방 id를 참조할 수 있게 ref로 보관합니다.
  selectedRoomIdRef.current = selectedRoomId;

  // 채팅방을 바꿀 때는 이전 방의 스크롤 위치를 버리고 새 방의 최신 메시지 위치로 강제 이동시킵니다.
  useEffect(() => {
    shouldForceScrollToBottomRef.current = true;
  }, [selectedRoomId]);

  useEffect(() => {
    setIsMessageSearchOpen(false);
    setMessageSearchKeyword('');
    setActiveSearchMatchIndex(0);
  }, [selectedRoomId]);

  // 방 목록 새로고침은 채팅방 생성 직후, 새 메시지 수신 후, 읽음 처리 후에 공통으로 재사용합니다.
  const refreshRooms = async (preferredRoomId?: number | null) => {
    const nextRooms = await getChatRooms();
    setRooms(nextRooms);
    syncHeaderUnreadIndicator(nextRooms);

    setSelectedRoomId((prev) => {
      if (preferredRoomId && nextRooms.some((room) => room.roomId === preferredRoomId)) {
        return preferredRoomId;
      }

      if (prev && nextRooms.some((room) => room.roomId === prev)) {
        return prev;
      }

      // 헤더에서 /chat 으로만 진입한 경우에는 목록만 보여주고 특정 방을 자동으로 열지 않습니다.
      if (prev === null) {
        return null;
      }

      return nextRooms[0]?.roomId ?? null;
    });
  };

  // 비로그인 사용자는 채팅 페이지에서 로그인 유도 화면만 보여줍니다.
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      setPageLoading(false);
    }
  }, [isLoggedIn, loading]);

  // 문의 버튼에서 roomId 없이 들어오면 target 정보로 방 생성/재사용 후 roomId로 정착시킵니다.
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let isMounted = true;

    const initialize = async () => {
      setPageLoading(true);
      setErrorMessage(null);

      try {
        const targetMemberIdParam = searchParams.get('targetMemberId');
        // footer에서 들어온 관리자 문의는 roomId 대신 adminInquiry=true 쿼리로만 구분합니다.
        const adminInquiryParam = searchParams.get('adminInquiry');
        const roomIdParam = searchParams.get('roomId');

        let preferredRoomId = roomIdParam ? Number(roomIdParam) : null;
        const targetKey = targetMemberIdParam
          ? `member:${targetMemberIdParam}`
          : adminInquiryParam === 'true'
            ? 'admin'
            : null;

        // 클래스 상세, 프리랜서 프로필, footer 문의하기는 처음엔 target 정보만 들고 들어옵니다.
        // 일반 문의(targetMemberId)와 관리자 문의(adminInquiry)를 같은 create-or-open API로 묶습니다.
        // 개발 모드 StrictMode나 빠른 상태 전환으로 effect가 다시 실행돼도, 같은 대상에 대한 방 생성/재사용 요청은 한 번만 보냅니다.
        if (targetKey && resolvedTargetKeyRef.current !== targetKey) {
          resolvedTargetKeyRef.current = targetKey;
          const directRoom = await createOrOpenDirectChatRoom({
            targetMemberId: targetMemberIdParam ? Number(targetMemberIdParam) : undefined,
            // 실제 관리자 이메일은 프론트가 모르고, 백엔드가 고정값을 사용해 대상 회원을 해석합니다.
            adminInquiry: adminInquiryParam === 'true',
          });

          // 새로 연 1:1 문의 방은 목록 새로고침 전에 바로 선택 상태에 넣어 최근 방 포커스에 덮이지 않게 합니다.
          setRooms((prev) => {
            const nextRooms = [directRoom, ...prev.filter((room) => room.roomId !== directRoom.roomId)];
            syncHeaderUnreadIndicator(nextRooms);
            return nextRooms;
          });
          setSelectedRoomId(directRoom.roomId);
          preferredRoomId = directRoom.roomId;
          setSearchParams({ roomId: String(directRoom.roomId) }, { replace: true });
        }

        if (!targetKey) {
          resolvedTargetKeyRef.current = null;
        }

        if (isMounted) {
          if (preferredRoomId) {
            setSelectedRoomId(preferredRoomId);
          }
          await refreshRooms(preferredRoomId);
        }
      } catch (error: any) {
        if (isMounted) {
          setErrorMessage(error?.response?.data?.message ?? '채팅방을 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, searchParams, setSearchParams]);

  // 현재 선택한 방이 바뀌면 전체 이력을 다시 읽고, 입장 시 unread도 읽음 처리합니다.
  useEffect(() => {
    if (!selectedRoomId || !isLoggedIn) {
      setMessages([]);
      return;
    }

    let isMounted = true;

    const loadRoomMessages = async () => {
      setRoomLoading(true);
      setErrorMessage(null);
      setMessages([]);

      try {
        const nextMessages = await getChatMessages(selectedRoomId);
        if (!isMounted) return;

        setMessages(nextMessages);
        await markChatRoomAsRead(selectedRoomId);
        await refreshRooms(selectedRoomId);
      } catch (error: any) {
        if (isMounted) {
          setErrorMessage(error?.response?.data?.message ?? '메시지를 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) {
          setRoomLoading(false);
        }
      }
    };

    loadRoomMessages();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, selectedRoomId]);

  // 실시간 메시지는 브라우저 기본 WebSocket으로 처리합니다. 별도 STOMP 라이브러리는 쓰지 않습니다.
  useEffect(() => {
    const token = getAccessToken();
    if (!token || !isLoggedIn) {
      return;
    }

    const socket = new WebSocket(buildWebSocketUrl(token));
    socketRef.current = socket;

    socket.onmessage = async (event) => {
      const payload = JSON.parse(event.data) as ChatSocketEvent;

      if (payload.type === 'ERROR') {
        setErrorMessage(payload.message);
        return;
      }

      if (payload.type === 'MESSAGE_CREATED') {
        const incomingMessage = payload.payload;

        // 어느 방에서 메시지가 왔든 좌측 목록의 최근 메시지/unread는 즉시 갱신합니다.
        await refreshRooms(selectedRoomIdRef.current);

        if (selectedRoomIdRef.current === incomingMessage.roomId) {
          setMessages((prev) => {
            if (prev.some((message) => message.messageId === incomingMessage.messageId)) {
              return prev;
            }
            return [...prev, incomingMessage];
          });

          // 현재 열려 있는 방에서 상대 메시지를 받으면 바로 읽음 처리해 badge가 남지 않게 합니다.
          if (incomingMessage.senderEmail !== user?.email) {
            try {
              await markChatRoomAsRead(incomingMessage.roomId);
              await refreshRooms(incomingMessage.roomId);
            } catch {
              // 읽음 처리는 다음 방 새로고침 때 다시 맞춰집니다.
            }
          }
        }
      }
    };

    socket.onerror = () => {
      setErrorMessage('실시간 채팅 연결 중 오류가 발생했습니다.');
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [isLoggedIn, user?.email]);

  // 채팅방을 처음 열거나 다시 들어왔을 때는 무조건 즉시 최하단으로 맞춥니다.
  useLayoutEffect(() => {
    if (!selectedRoomId || roomLoading || !shouldForceScrollToBottomRef.current) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollMessageListToBottom('auto');
      shouldForceScrollToBottomRef.current = false;
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [messages, roomLoading, selectedRoomId]);

  // 같은 방 안에서 새 메시지가 추가될 때만 부드럽게 최하단으로 이동합니다.
  useEffect(() => {
    if (!messages.length || shouldForceScrollToBottomRef.current) {
      return;
    }

    scrollMessageListToBottom('smooth');
  }, [messages]);

  // 현재 선택된 채팅방 헤더/본문 렌더링에 쓰는 선택 방 데이터입니다.
  const selectedRoom = useMemo(
    () => rooms.find((room) => room.roomId === selectedRoomId) ?? null,
    [rooms, selectedRoomId],
  );
  const isSelectedRoomFreelancer = selectedRoom?.otherMemberRole === 'F';

  // 좌측 검색창은 상대 이름, 이메일, 최근 메시지를 기준으로 필터링합니다.
  const filteredRooms = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return rooms;

    return rooms.filter((room) => {
      return (
        room.otherMemberName.toLowerCase().includes(keyword) ||
        room.otherMemberEmail.toLowerCase().includes(keyword) ||
        (room.lastMessage ?? '').toLowerCase().includes(keyword)
      );
    });
  }, [rooms, searchKeyword]);

  const searchedMessageIds = useMemo(() => {
    const keyword = messageSearchKeyword.trim().toLowerCase();
    if (!keyword) {
      return [];
    }

    return messages
      .filter((message) => message.message.toLowerCase().includes(keyword))
      .map((message) => message.messageId);
  }, [messages, messageSearchKeyword]);

  useEffect(() => {
    setActiveSearchMatchIndex(0);
  }, [messageSearchKeyword, selectedRoomId]);

  useEffect(() => {
    if (!isMessageSearchOpen) {
      return;
    }

    messageSearchInputRef.current?.focus();
  }, [isMessageSearchOpen]);

  useEffect(() => {
    if (!searchedMessageIds.length) {
      return;
    }

    const safeIndex = ((activeSearchMatchIndex % searchedMessageIds.length) + searchedMessageIds.length) % searchedMessageIds.length;
    const activeMessageId = searchedMessageIds[safeIndex];
    const activeMessageElement = messageItemRefs.current[activeMessageId];

    activeMessageElement?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    });
  }, [activeSearchMatchIndex, searchedMessageIds]);

  const renderHighlightedMessage = (message: string, keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      return message;
    }

    const pattern = new RegExp(`(${escapeRegExp(trimmedKeyword)})`, 'gi');
    const segments = message.split(pattern);

    return segments.map((segment, index) =>
      segment.toLowerCase() === trimmedKeyword.toLowerCase() ? (
        <mark key={`${segment}-${index}`} className="bg-yellow-200/80 text-inherit rounded px-0.5">
          {segment}
        </mark>
      ) : (
        <React.Fragment key={`${segment}-${index}`}>{segment}</React.Fragment>
      ),
    );
  };

  // 전송 버튼과 Enter 키는 같은 WebSocket SEND_MESSAGE 이벤트를 사용합니다.
  const handleSend = () => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN || !selectedRoomId || !input.trim()) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: 'SEND_MESSAGE',
        roomId: selectedRoomId,
        message: input.trim(),
      }),
    );
    setInput('');
  };

  const handleLeaveRoom = async () => {
    if (!selectedRoomId || leavingRoom) {
      return;
    }

    const shouldLeave = window.confirm('이 채팅방에서 나가시겠습니까? 목록에서 숨겨지며, 같은 상대와 다시 문의하면 기존 대화가 복구됩니다.');
    if (!shouldLeave) {
      return;
    }

    setLeavingRoom(true);

    try {
      const leavingRoomId = selectedRoomId;
      await leaveChatRoom(leavingRoomId);

      const nextRooms = await getChatRooms();
      setRooms(nextRooms);
      syncHeaderUnreadIndicator(nextRooms);
      setMessages([]);

      const nextSelectedRoomId = nextRooms[0]?.roomId ?? null;
      setSelectedRoomId(nextSelectedRoomId);

      if (nextSelectedRoomId) {
        setSearchParams({ roomId: String(nextSelectedRoomId) }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message ?? '채팅방 나가기에 실패했습니다.');
    } finally {
      setLeavingRoom(false);
    }
  };

  if (!loading && !isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center gap-4 px-4">
        <MessageCircle className="text-coral" size={40} />
        <p className="text-gray-600 text-center">채팅은 로그인 후 이용할 수 있습니다.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-coral text-white rounded-2xl font-bold hover:bg-coral/90 transition-all"
        >
          로그인하러 가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-120px)]">
      <div className="bg-white rounded-[40px] shadow-sm border border-coral/10 overflow-hidden flex h-full">
        <aside
          className={cn(
            'w-full md:w-80 border-r border-coral/10 flex flex-col bg-ivory/20',
            // 모바일에서는 방을 고르면 목록을 숨기고 대화창만 보여줍니다.
            selectedRoomId ? 'hidden md:flex' : 'flex',
          )}
        >
          <div className="p-6 border-b border-coral/10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">채팅</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="이름, 이메일 검색"
                className="w-full pl-10 pr-4 py-2 bg-white border border-coral/10 rounded-xl outline-none focus:border-coral transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {pageLoading ? (
              <div className="p-6 text-sm text-gray-400">채팅방을 불러오는 중입니다.</div>
            ) : filteredRooms.length === 0 ? (
              <div className="p-6 text-sm text-gray-400 leading-relaxed">
                아직 열린 대화가 없습니다.
                <br />
                클래스 상세, 프리랜서 프로필, 1:1 문의에서 대화를 시작해보세요.
              </div>
            ) : (
              filteredRooms.map((room) => (
                <button
                  key={room.roomId}
                  onClick={() => {
                    // 방 선택 시 URL도 roomId 기준으로 맞춰 새로고침해도 같은 방을 열 수 있게 합니다.
                    setSelectedRoomId(room.roomId);
                    setSearchParams({ roomId: String(room.roomId) }, { replace: true });
                  }}
                  className={cn(
                    'w-full p-4 flex gap-3 items-center cursor-pointer transition-all',
                    selectedRoomId === room.roomId
                      ? 'bg-white border-l-4 border-coral'
                      : 'hover:bg-white hover:shadow-sm hover:-translate-y-[1px]',
                  )}
                >
                  <div className="w-12 h-12 rounded-2xl bg-coral/10 overflow-hidden flex items-center justify-center text-coral font-bold">
                    {room.otherMemberImgUrl ? (
                      <img src={room.otherMemberImgUrl} alt={room.otherMemberName} className="w-full h-full object-cover" />
                    ) : (
                      room.otherMemberName.slice(0, 1)
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-center mb-1 gap-2">
                      <span className="font-bold text-gray-900 truncate">{room.otherMemberName}</span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatRoomTime(room.lastMessageAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 truncate flex-1">
                        {room.lastMessage || '대화를 시작해보세요.'}
                      </p>
                      {room.unreadCount > 0 && (
                        <span className="min-w-5 h-5 px-1 bg-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <main
          className={cn(
            'relative flex-1 flex-col bg-white',
            // 모바일에서는 선택된 방이 있을 때만 본문을 보여줍니다.
            selectedRoomId ? 'flex' : 'hidden md:flex',
          )}
        >
          {selectedRoom ? (
            <>
              <div className="p-6 border-b border-coral/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button
                    // 모바일 뒤로가기는 실제 브라우저 back이 아니라 "목록으로 복귀" 동작입니다.
                    onClick={() => setSelectedRoomId(null)}
                    className="md:hidden p-2 text-gray-400"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  {isSelectedRoomFreelancer ? (
                    <button
                      onClick={() => navigate(`/freelancer/${selectedRoom.otherMemberId}`)}
                      className="group flex items-center gap-3 rounded-2xl px-2 py-1 -mx-2 -my-1 text-left cursor-pointer transition-all hover:bg-coral/5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-coral/10 overflow-hidden flex items-center justify-center text-coral font-bold transition-all group-hover:bg-coral/15">
                        {selectedRoom.otherMemberImgUrl ? (
                          <img
                            src={selectedRoom.otherMemberImgUrl}
                            alt={selectedRoom.otherMemberName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          selectedRoom.otherMemberName.slice(0, 1)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 transition-colors group-hover:text-coral">
                            {selectedRoom.otherMemberName}
                          </h3>
                          <span className="text-[11px] font-medium text-coral">프리랜서</span>
                        </div>
                        <span className="text-xs text-gray-400">{selectedRoom.otherMemberEmail}</span>
                      </div>
                    </button>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-coral/10 overflow-hidden flex items-center justify-center text-coral font-bold">
                        {selectedRoom.otherMemberImgUrl ? (
                          <img
                            src={selectedRoom.otherMemberImgUrl}
                            alt={selectedRoom.otherMemberName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          selectedRoom.otherMemberName.slice(0, 1)
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{selectedRoom.otherMemberName}</h3>
                        <span className="text-xs text-gray-400">{selectedRoom.otherMemberEmail}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMessageSearchOpen((prev) => !prev)}
                    className={cn(
                      'w-10 h-10 rounded-xl border border-gray-200 text-gray-500 flex items-center justify-center transition-all',
                      isMessageSearchOpen ? 'bg-coral/5 text-coral border-coral/20' : 'hover:bg-gray-50',
                    )}
                    aria-label="대화 내역 검색"
                    title="대화 내역 검색"
                  >
                    <Search size={18} />
                  </button>
                  <button
                    onClick={handleLeaveRoom}
                    disabled={leavingRoom}
                    className="px-4 py-2 text-sm font-bold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    채팅방 나가기
                  </button>
                </div>
              </div>

              {isMessageSearchOpen && (
                <div className="px-6 py-3 border-b border-coral/10 bg-ivory/20 flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      ref={messageSearchInputRef}
                      type="text"
                      value={messageSearchKeyword}
                      onChange={(e) => setMessageSearchKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchedMessageIds.length > 0) {
                          e.preventDefault();
                          setActiveSearchMatchIndex((prev) =>
                            e.shiftKey
                              ? (prev - 1 + searchedMessageIds.length) % searchedMessageIds.length
                              : (prev + 1) % searchedMessageIds.length,
                          );
                        }
                      }}
                      placeholder="현재 채팅방 대화 검색"
                      className="w-full pl-9 pr-9 py-2.5 bg-white border border-coral/10 rounded-xl outline-none focus:border-coral transition-all text-sm"
                    />
                    {messageSearchKeyword && (
                      <button
                        onClick={() => {
                          setMessageSearchKeyword('');
                          setActiveSearchMatchIndex(0);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="검색어 지우기"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-500 min-w-16 text-center">
                    {searchedMessageIds.length === 0 && messageSearchKeyword.trim()
                      ? '0건'
                      : `${searchedMessageIds.length === 0 ? 0 : activeSearchMatchIndex + 1}/${searchedMessageIds.length}`}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setActiveSearchMatchIndex((prev) =>
                          searchedMessageIds.length === 0 ? 0 : (prev - 1 + searchedMessageIds.length) % searchedMessageIds.length,
                        )
                      }
                      disabled={searchedMessageIds.length === 0}
                      className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="이전 검색 결과"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setActiveSearchMatchIndex((prev) =>
                          searchedMessageIds.length === 0 ? 0 : (prev + 1) % searchedMessageIds.length,
                        )
                      }
                      disabled={searchedMessageIds.length === 0}
                      className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="다음 검색 결과"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              )}

              <div ref={messageListRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-ivory/10">
                {roomLoading ? (
                  <div className="text-sm text-gray-400">메시지를 불러오는 중입니다.</div>
                ) : messages.length === 0 ? (
                  <div className="text-sm text-gray-400 leading-relaxed">
                    아직 메시지가 없습니다.
                    <br />
                    첫 메시지를 보내 대화를 시작해보세요.
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine = message.senderEmail === user?.email;
                    const isMatchedMessage = searchedMessageIds.includes(message.messageId);
                    const activeMessageId =
                      searchedMessageIds.length > 0
                        ? searchedMessageIds[((activeSearchMatchIndex % searchedMessageIds.length) + searchedMessageIds.length) % searchedMessageIds.length]
                        : null;
                    const isActiveMatchedMessage = activeMessageId === message.messageId;
                    return (
                      <div
                        key={message.messageId}
                        ref={(element) => {
                          messageItemRefs.current[message.messageId] = element;
                        }}
                        className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
                      >
                        <div className={cn('max-w-[75%] flex flex-col gap-1', isMine ? 'items-end' : 'items-start')}>
                          <div
                            className={cn(
                              'p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap transition-all',
                              isMine
                                ? 'bg-coral text-white rounded-tr-none'
                                : 'bg-gray-100 text-gray-900 rounded-tl-none',
                              isMatchedMessage && 'ring-2 ring-yellow-200',
                              isActiveMatchedMessage && 'ring-2 ring-coral/40',
                            )}
                          >
                            {renderHighlightedMessage(message.message, messageSearchKeyword)}
                          </div>
                          <span className="text-[10px] text-gray-400 px-1">{formatMessageTime(message.sentAt)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <button
                onClick={() => scrollMessageListToBottom('smooth')}
                className="absolute bottom-24 right-6 z-10 w-10 h-10 rounded-full border border-coral/20 bg-white text-coral flex items-center justify-center hover:bg-coral/5 transition-all shadow-sm"
                aria-label="최신 메시지로 이동"
                title="최신 메시지로 이동"
              >
                <ChevronDown size={18} />
              </button>

              <div className="px-6 py-4 border-t border-coral/10">
                {errorMessage && (
                  <div className="mb-3 text-sm text-red-500">{errorMessage}</div>
                )}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="메시지를 입력하세요"
                    className="flex-1 px-4 py-3 rounded-2xl border border-coral/10 outline-none focus:border-coral transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-12 h-12 rounded-2xl bg-coral text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              대화할 채팅방을 선택해주세요.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
