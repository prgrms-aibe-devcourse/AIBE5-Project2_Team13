import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

interface AIChatContextType {
  messages: Message[];
  isChatOpen: boolean;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsChatOpen: (isOpen: boolean) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, text: string) => void;
  clearMessages: () => void;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

const INITIAL_MESSAGE: Message = {
  id: '1',
  role: 'bot',
  text: '안녕하세요! 포근이 AI입니다. 무엇을 도와드릴까요?',
};

/**
 * 🤖 AI 채팅 Context
 *
 * ✅ 설계 원칙
 *
 * 1. 일반 채팅(AICounseling)과 미니 채팅(MiniAIChat)이 같은 메시지 목록을 공유합니다.
 *    → 미니 채팅에서 나눈 대화를 전체 화면에서 이어볼 수 있습니다.
 *
 * 2. 페이지 이동 시 자동 초기화 하지 않습니다.
 *    → 기존 ChatHistoryManager(페이지 이동마다 clearMessages)를 제거했습니다.
 *    → 대화 내역은 사용자가 직접 초기화 버튼을 누를 때만 지워집니다.
 *
 * 3. 계정 변경 시 대화 내역을 초기화합니다. (WishContext/FollowContext와 동일 패턴)
 *    - 로그아웃          → user = null → 초기 메시지로 리셋
 *    - 다른 계정 로그인  → user.email 변경 감지 → 초기 메시지로 리셋
 *    → 개인 대화 내역이 다른 계정에 노출되지 않습니다.
 *
 * 4. 비로그인 상태에서 대화 가능 — 메모리에만 보관합니다.
 *    로그인하면 user.email이 생기므로 useEffect가 발동해 초기화됩니다.
 */
export function AIChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); // 계정 변경 감지용
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // ─────────────────────────────────────
  // 핵심 로직 — user.email 변경 시 초기화
  //
  // user === null      → 로그아웃 → 초기 메시지로 리셋
  // user.email 변경   → 다른 계정 로그인 → 초기 메시지로 리셋
  // ─────────────────────────────────────
  useEffect(() => {
    setMessages([INITIAL_MESSAGE]);
    setIsChatOpen(false); // 미니 채팅 창도 닫기
  }, [user?.email]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const updateMessage = (id: string, text: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, text } : m));
  };

  const clearMessages = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <AIChatContext.Provider value={{
      messages,
      isChatOpen,
      setMessages,
      setIsChatOpen,
      addMessage,
      updateMessage,
      clearMessages,
    }}>
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error('useAIChat must be used within an AIChatProvider');
  }
  return context;
}
