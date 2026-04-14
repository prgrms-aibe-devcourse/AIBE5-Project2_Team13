import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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

const INITIAL_MESSAGE: Message = { id: '1', role: 'bot', text: '안녕하세요! 포근이 AI입니다. 무엇을 도와드릴까요?' };

// Location을 사용하는 컴포넌트를 분리합니다.
export function ChatHistoryManager() {
  const { clearMessages } = useAIChat(); // context 안에서 사용해야 합니다.
  const location = useLocation();

  useEffect(() => {
    clearMessages();
  }, [location.pathname]); // clearMessages는 의존성 배열에서 제외하여 무한 루프 방지

  return null;
}

export function AIChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const updateMessage = (id: string, text: string) => {
    setMessages((prev) => prev.map(m => m.id === id ? { ...m, text } : m));
  };

  const clearMessages = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <AIChatContext.Provider value={{ messages, isChatOpen, setMessages, setIsChatOpen, addMessage, updateMessage, clearMessages }}>
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