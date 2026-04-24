import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, HelpCircle, X, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import MiniAIChat from './MiniAIChat';
import { useAIChat } from '../context/AIChatContext';

export default function FloatingSupportButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isChatOpen, setIsChatOpen } = useAIChat();
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isRequestBoardPage = location.pathname === '/requests';

  useEffect(() => {
    const handleScroll = () => {
      // Show only when scrolled more than 500px
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={cn(
      "fixed right-8 z-[9999] flex flex-col items-end gap-4",
      isRequestBoardPage ? "bottom-28" : "bottom-8"
    )}>
      {/* Mini AI Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <div className="mb-2">
            <MiniAIChat onClose={() => setIsChatOpen(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Selection Menu (Speech Bubble) */}
      <AnimatePresence>
        {isOpen && !isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9, originX: 1, originY: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-coral/10 p-2 min-w-[200px] overflow-hidden mb-2"
          >
            <button
              onClick={() => {
                setIsChatOpen(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-ivory rounded-2xl transition-all text-gray-700 font-bold group"
            >
              <div className="w-9 h-9 bg-white border border-coral/10 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform shadow-sm">
                <img 
                  src="https://github.com/lei-3m/AIBE5/blob/main/img/ponya.png?raw=true" 
                  alt="포근이" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-sm">AI 상담</span>
            </button>
            <div className="h-px bg-coral/5 mx-2 my-1" />
            <button
              onClick={() => {
                navigate('/faq');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-ivory rounded-2xl transition-all text-gray-700 font-bold group"
            >
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <HelpCircle size={20} />
              </div>
              <span className="text-sm">자주 묻는 질문</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      <AnimatePresence>
        {(isVisible || isChatOpen) && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              width: isHovered ? 'auto' : '44px',
              height: '44px',
            }}
            exit={{ scale: 0, opacity: 0 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
              if (isChatOpen) {
                setIsChatOpen(false);
              } else {
                setIsOpen(!isOpen);
              }
            }}
            className={cn(
              "bg-ivory/70 backdrop-blur-md border border-coral/20 rounded-full flex items-center shadow-lg hover:bg-ivory/90 transition-all text-coral overflow-hidden",
              isHovered ? "px-4" : "justify-center"
            )}
            id="floating-support-btn"
          >
            <div className={cn(
              "flex items-center justify-center shrink-0 transition-transform duration-300",
              isHovered ? "mr-2" : ""
            )}>
              {isOpen || isChatOpen ? <X size={18} /> : <MessageCircle size={18} />}
            </div>
            
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap font-bold text-[13px] tracking-tight"
                >
                  {isChatOpen ? "채팅 닫기" : "도움이 필요하신가요?"}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
