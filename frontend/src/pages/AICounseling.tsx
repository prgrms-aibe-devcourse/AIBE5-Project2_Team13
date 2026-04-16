import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Bot, Loader2, Cat, Trash2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useAIChat, Message } from '../context/AIChatContext';

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' } as any);

const LOADING_MESSAGES = [
  "포근이가 당신의 이야기를 경청하고 있어요...",
  "당신의 마음에 꼭 맞는 취미를 찾고 있어요...",
  "포근한 답변을 정성껏 준비 중입니다...",
  "거의 다 준비됐어요! 조금만 기다려주세요."
];

export default function AICounseling() {
  const { messages, addMessage, updateMessage, clearMessages } = useAIChat();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      const response = await (genAI as any).models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [{ text: `사용자의 고민이나 상황: "${input}". 당신은 '포근'이라는 서비스의 따뜻하고 친절한 상담사 캐릭터 '포근이'입니다. 사용자의 고민을 공감해주고, 그에 어울리는 취미나 활동을 2~3가지 제안해주세요. 한국어로 답변하고, 말투는 매우 다정하고 포근하게 해주세요.` }]
          }
        ]
      });
      const text = response.text;

      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'bot', 
        text: text || '죄송해요, 잠시 포근이가 생각에 잠겼나 봐요. 다시 말씀해 주시겠어요?' 
      };
      addMessage(botMsg);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: '오류가 발생했어요. 나중에 다시 시도해주세요.' };
      addMessage(errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-6 text-center relative">
        <div className="inline-flex w-20 h-20 bg-white rounded-3xl mb-3 shadow-md border border-coral/10 overflow-hidden">
          <img 
            src="https://github.com/lei-3m/AIBE5/blob/main/img/ponya.png?raw=true" 
            alt="포근이" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">포근이 상담소</h1>
        <p className="text-gray-sub">마음속 이야기를 들려주세요. 포근이가 함께할게요.</p>
        
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-coral/10 overflow-hidden flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden ${msg.role === 'user' ? 'bg-coral text-white' : 'bg-white shadow-sm shadow-coral/20 border border-coral/10'}`}>
                  {msg.role === 'user' ? (
                    <User size={20} />
                  ) : (
                    <img 
                      src="https://github.com/lei-3m/AIBE5/blob/main/img/ponya.png?raw=true" 
                      alt="포근이" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <div className={`p-4 rounded-3xl ${msg.role === 'user' ? 'bg-coral text-white rounded-tr-none' : 'bg-ivory text-gray-900 rounded-tl-none'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 items-center bg-ivory p-4 rounded-3xl rounded-tl-none">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm border border-coral/10 animate-pulse">
                  <img 
                    src="https://github.com/lei-3m/AIBE5/blob/main/img/ponya.png?raw=true" 
                    alt="포근이" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={loadingMessageIndex}
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    className="text-sm text-gray-500"
                  >
                    {LOADING_MESSAGES[loadingMessageIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-ivory/50 border-t border-coral/10">
          <div className="relative">
            <input
              type="text"
              value={input}
              disabled={isTyping}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSend()}
              placeholder={isTyping ? "포근이가 생각 중이에요..." : "고민이나 궁금한 점을 입력하세요..."}
              className="w-full px-6 py-4 bg-white border-2 border-transparent focus:border-coral rounded-2xl outline-none transition-all pr-16 shadow-sm disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-2 bottom-2 px-4 bg-coral text-white rounded-xl hover:bg-coral/90 transition-all disabled:opacity-50"
            >
              {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}