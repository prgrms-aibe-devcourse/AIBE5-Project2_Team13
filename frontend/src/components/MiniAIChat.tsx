import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Loader2, Cat, X, Maximize2, Trash2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useNavigate } from 'react-router-dom';
import { useAIChat, Message } from '../context/AIChatContext';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const LOADING_MESSAGES = [
  "포근이가 생각 중...",
  "취미를 찾는 중...",
  "답변 준비 중...",
];

interface MiniAIChatProps {
  onClose: () => void;
}

export default function MiniAIChat({ onClose }: MiniAIChatProps) {
  const { messages, addMessage, clearMessages } = useAIChat();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTyping) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    addMessage(userMsg);
    setInput('');
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [{ text: `사용자의 고민이나 상황: "${input}". 당신은 '포근'이라는 서비스의 따뜻하고 친절한 상담사 캐릭터 '포근이'입니다. 사용자의 고민을 공감해주고, 그에 어울리는 취미나 활동을 짧고 다정하게 제안해주세요. 한국어로 답변해주세요.` }]
          }
        ],
      });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: response.text || '죄송해요, 잠시 포근이가 생각에 잠겼나 봐요.'
      };
      addMessage(botMsg);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: '오류가 발생했어요. API 키가 정확한지 확인해주세요.' };
      addMessage(errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="w-[350px] h-[500px] bg-white rounded-[32px] shadow-2xl border border-coral/10 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 bg-white border-b border-coral/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-coral/10 shadow-sm">
            <img
              src="https://github.com/lei-3m/AIBE5/blob/main/img/ponya.png?raw=true"
              alt="포근이"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-bold text-gray-900 text-sm">포근 AI 추천 가이드</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearMessages}
            className="p-2 text-gray-400 hover:text-coral transition-colors"
            title="대화 초기화"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => {
              navigate('/ai-recommend');
              onClose();
            }}
            className="p-2 text-gray-400 hover:text-coral transition-colors"
            title="전체 화면으로 보기"
          >
            <Maximize2 size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-coral transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-ivory/20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden ${msg.role === 'user' ? 'bg-coral text-white' : 'bg-white border border-coral/10 shadow-sm'}`}>
                {msg.role === 'user' ? (
                  <User size={14} />
                ) : (
                  <img
                    src="https://github.com/lei-3m/AIBE5/blob/main/img/ponya.png?raw=true"
                    alt="포근이"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-coral text-white rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none shadow-sm border border-coral/5'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-2 items-center bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-coral/5">
              <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-coral/10 shadow-sm animate-pulse">
                <img
                  src="https://github.com/lei-3m/AIBE5/blob/main/img/ponya.png?raw=true"
                  alt="포근이"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs text-gray-400">
                {LOADING_MESSAGES[loadingMessageIndex]}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-coral/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            disabled={isTyping}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSend()}
            placeholder="메시지를 입력하세요..."
            className="w-full pl-4 pr-10 py-3 bg-ivory border-2 border-transparent focus:border-coral rounded-xl outline-none transition-all text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-coral disabled:opacity-50"
          >
            {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}