import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Send, Paperclip, MoreVertical, ChevronLeft, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface ChatRoom {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

const MOCK_ROOMS: ChatRoom[] = [
  { id: '1', name: '김화가 프리랜서', lastMessage: '수채화 클래스 준비물은 제가 다 준비해드려요!', time: '오후 2:30', unread: 1, avatar: 'https://picsum.photos/seed/avatar1/100/100' },
  { id: '2', name: '이지요가 프리랜서', lastMessage: '네, 토요일 오후 2시 예약 가능합니다.', time: '오전 11:15', unread: 0, avatar: 'https://picsum.photos/seed/avatar2/100/100' },
  { id: '3', name: '셰프박 프리랜서', lastMessage: '파스타 면 삶는 법부터 차근차근 알려드릴게요.', time: '어제', unread: 0, avatar: 'https://picsum.photos/seed/avatar3/100/100' },
];

const MOCK_MESSAGES: Message[] = [
  { id: '1', text: '안녕하세요! 수채화 클래스 문의드려요.', sender: 'me', time: '오후 2:15' },
  { id: '2', text: '안녕하세요! 반갑습니다. 어떤 점이 궁금하신가요?', sender: 'other', time: '오후 2:16' },
  { id: '3', text: '준비물을 따로 챙겨가야 할까요?', sender: 'me', time: '오후 2:20' },
  { id: '4', text: '수채화 클래스 준비물은 제가 다 준비해드려요! 몸만 편하게 오시면 됩니다.', sender: 'other', time: '오후 2:30' },
];

export default function Chat() {
  const [rooms, setRooms] = useState<ChatRoom[]>(MOCK_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom>(MOCK_ROOMS[0]);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [macros, setMacros] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('userRole'));
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear unread count for the selected room when chat is opened or room is changed
    setRooms(prev => prev.map(room => 
      room.id === selectedRoom.id ? { ...room, unread: 0 } : room
    ));
  }, [selectedRoom.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch macros for freelancers
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Always sync role from localStorage first for immediate UI response
      const role = localStorage.getItem('userRole');
      console.log('Detected user role:', role);
      setUserRole(role);

      if (user) {
        console.log('User authenticated:', user.uid);
        const userDocRef = doc(db, 'users', user.uid);
        
        // Use onSnapshot for real-time updates of both role and macros
        const unsubDoc = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('Firestore user data:', data);
            
            // Sync role from Firestore if it differs (e.g., just upgraded)
            if (data.role && data.role !== role) {
              console.log('Updating role from Firestore:', data.role);
              setUserRole(data.role);
              localStorage.setItem('userRole', data.role);
            }

            if (data.role === 'ROLE_FREELANCER') {
              if (data.macros && data.macros.length > 0) {
                console.log('Setting macros from Firestore:', data.macros);
                setMacros(data.macros);
              } else {
                const defaultMacros = [
                  '안녕하세요! 상담 가능합니다.',
                  '문의하신 내용은 확인 후 연락드릴게요.',
                  '결제 확인되었습니다.'
                ];
                console.log('Initializing default macros');
                setMacros(defaultMacros);
                try {
                  await updateDoc(userDocRef, { macros: defaultMacros });
                } catch (err) {
                  console.error("Error initializing macros:", err);
                }
              }
            }
          } else {
            console.log('User document does not exist in Firestore');
          }
        });
        return () => unsubDoc();
      } else {
        console.log('User not authenticated');
        setMacros([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMsg]);
    setInput('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`파일 '${file.name}'이(가) 선택되었습니다. (데모용)`);
      const newMsg: Message = {
        id: Date.now().toString(),
        text: `📎 파일 첨부: ${file.name}`,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMsg]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-120px)]">
      <div className="bg-white rounded-[40px] shadow-sm border border-coral/10 overflow-hidden flex h-full">
        {/* Sidebar */}
        <aside className="w-full md:w-80 border-r border-coral/10 flex flex-col bg-ivory/20">
          <div className="p-6 border-b border-coral/10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">채팅</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="대화방 검색"
                className="w-full pl-10 pr-4 py-2 bg-white border border-coral/10 rounded-xl outline-none focus:border-coral transition-all text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={cn(
                  "w-full p-4 flex gap-3 items-center transition-all hover:bg-white",
                  selectedRoom.id === room.id ? "bg-white border-l-4 border-coral" : ""
                )}
              >
                <img src={room.avatar} alt={room.name} className="w-12 h-12 rounded-2xl object-cover" />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-900 truncate">{room.name}</span>
                    <span className="text-[10px] text-gray-400">{room.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{room.lastMessage}</p>
                </div>
                {room.unread > 0 && (
                  <span className="w-5 h-5 bg-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {room.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Chat Window */}
        <main className="flex-1 flex flex-col bg-white">
          {/* Top Bar */}
          <div className="p-4 md:p-6 border-b border-coral/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="md:hidden p-2 text-gray-400">
                <ChevronLeft size={24} />
              </button>
              <div className="relative">
                <img src={selectedRoom.avatar} alt={selectedRoom.name} className="w-10 h-10 rounded-xl object-cover" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{selectedRoom.name}</h3>
                <span className="text-[10px] text-green-500 font-medium">현재 활동 중</span>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-coral transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-ivory/10">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.sender === 'me' ? "justify-end" : "justify-start")}>
                <div className={cn("flex gap-2 max-w-[75%]", msg.sender === 'me' ? "flex-row-reverse" : "flex-row")}>
                  {msg.sender === 'other' && (
                    <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-coral" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <div
                      className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                        msg.sender === 'me'
                          ? "bg-coral text-white rounded-tr-none"
                          : "bg-gray-100 text-gray-900 rounded-tl-none"
                      )}
                    >
                      {msg.text}
                    </div>
                    <span className={cn("text-[10px] text-gray-400 px-1", msg.sender === 'me' ? "text-right" : "text-left")}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 border-t border-coral/10">
            {/* Macro Buttons for Freelancers */}
            {userRole === 'ROLE_FREELANCER' && macros.length > 0 && (
              <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                <div className="flex items-center gap-2 px-2 py-1 bg-coral/5 rounded-lg mr-1">
                  <MessageSquare size={14} className="text-coral" />
                  <span className="text-[10px] font-bold text-coral whitespace-nowrap">매크로</span>
                </div>
                {macros.map((macro, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(prev => prev ? `${prev} ${macro}` : macro)}
                    className="whitespace-nowrap px-4 py-2 bg-white text-gray-600 text-xs font-bold rounded-full hover:bg-coral hover:text-white transition-all border border-coral/20 shadow-sm"
                  >
                    {macro}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-ivory text-gray-400 rounded-2xl hover:text-coral transition-colors"
              >
                <Plus size={20} />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-ivory text-gray-400 rounded-2xl hover:text-coral transition-colors hidden md:block"
              >
                <Paperclip size={20} />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="메시지를 입력하세요..."
                  className="w-full px-6 py-3 bg-ivory border-2 border-transparent focus:border-coral rounded-2xl outline-none transition-all pr-12"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-coral disabled:opacity-30"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
