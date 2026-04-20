import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Menu,
  X,
  MessageCircle,
  LogOut,
  Search,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext';
import { getChatRooms } from '@/src/api/chat';
import { DEFAULT_PROFILE_IMAGE_URL } from '@/src/lib/profileImage';
import { getFreelancerApplicationStatus } from '@/src/api/freelancerRegistration';
import { useEffect } from 'react';
import { clearStoredFreelancerApplicationStatus, getStoredFreelancerApplicationStatus, setStoredFreelancerApplicationStatus } from '@/src/lib/freelancerApplication';

type Role = 'ADMIN' | 'FREELANCER' | 'USER';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [hasNewNoti, setHasNewNoti] = useState(true);
  const [hasNewChat, setHasNewChat] = useState(false);

const { user, logout, loading } = useAuth();
const isLoggedIn = !loading && !!user;
  const [hasPendingFreelancerApplication, setHasPendingFreelancerApplication] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const role = (user?.role as Role) ?? 'USER';

  useEffect(() => {
    if (!isLoggedIn || role !== 'USER') {
      setHasPendingFreelancerApplication(false);
      if (role !== 'USER') {
        clearStoredFreelancerApplicationStatus();
      }
      return;
    }

    let isMounted = true;
    setHasPendingFreelancerApplication(getStoredFreelancerApplicationStatus() === 'W');

    getFreelancerApplicationStatus()
      .then((status) => {
        if (isMounted) {
          if (status.approvalStatusCode) {
            setStoredFreelancerApplicationStatus(status.approvalStatusCode);
          } else {
            clearStoredFreelancerApplicationStatus();
          }
          setHasPendingFreelancerApplication(status.approvalStatusCode === 'W');
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasPendingFreelancerApplication(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, role, location.pathname]);

  useEffect(() => {
    if (!isLoggedIn) {
      setHasNewChat(false);
      return;
    }

    let isMounted = true;

    // 헤더 채팅 점은 목업 상태가 아니라 현재 채팅방 목록의 unread 합계 기준으로만 표시합니다.
    getChatRooms()
      .then((rooms) => {
        if (isMounted) {
          setHasNewChat(rooms.some((room) => room.unreadCount > 0));
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasNewChat(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, location.pathname]);

  useEffect(() => {
    const handleUnreadUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ hasUnread?: boolean }>;
      setHasNewChat(customEvent.detail?.hasUnread === true);
    };

    // 채팅방 진입 후 unread가 사라지는 순간 헤더 점도 같은 기준으로 바로 반영합니다.
    window.addEventListener('chat-unread-updated', handleUnreadUpdate as EventListener);

    return () => {
      window.removeEventListener('chat-unread-updated', handleUnreadUpdate as EventListener);
    };
  }, []);

  const navItems = [
    { name: 'AI 추천', path: '/ai-recommend' },
    { name: '클래스 찾기', path: '/browse' },
    { name: '클래스 요청', path: '/requests' },
  ];

  const roleBasedNavItems =
    isLoggedIn && role === 'USER' && !hasPendingFreelancerApplication
      ? [{ name: '프리랜서 등록', path: '/expert-register' }]
      : [];

  const finalNavItems = [...navItems, ...roleBasedNavItems];

  const roleLabel: Record<Role, string> = {
    ADMIN: '관리자',
    FREELANCER: '프리랜서',
    USER: '회원',
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full bg-ivory/80 backdrop-blur-md border-b border-coral/10" />
    );
  }

  const notifications = [
    { id: 1, text: '새로운 추천 클래스가 도착했어요!', time: '5분 전' },
    { id: 2, text: '요청하신 클래스에 댓글이 달렸습니다.', time: '1시간 전' },
    { id: 3, text: '포근 서비스에 오신 것을 환영합니다!', time: '1일 전' },
  ];

  const handleNotiClick = () => {
    setIsNotiOpen(v => !v);
    setHasNewNoti(false);
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-ivory/80 backdrop-blur-md border-b border-coral/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-6 shrink-0">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-coral/10 overflow-hidden">
              <img
                src="https://github.com/lei-3m/AIBE5/blob/main/img/pogeunLogo.png?raw=true"
                alt="Pogeun Logo"
                className="w-full h-full object-contain p-1"
              />
            </div>
            <span className="text-2xl font-bold text-coral">포근</span>
          </Link>

          {/* Search */}
          <div className="hidden md:flex w-full max-w-[180px] mr-4 shrink-0">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="검색"
                className="w-full h-10 pl-10 pr-4 bg-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-coral/20 outline-none"
              />
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex flex-1 justify-center gap-6">
            {finalNavItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'text-base font-medium hover:text-coral',
                  location.pathname === item.path
                    ? 'text-coral'
                    : 'text-gray-sub'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="hidden md:flex items-center gap-4 shrink-0">

            {user ? (
              <>
                {/* Notification (유지) */}
                <div className="relative">
                  <button
                    onClick={handleNotiClick}
                    className="p-2 text-gray-sub hover:text-coral"
                  >
                    <Bell size={24} />
                    {hasNewNoti && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-coral rounded-full" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotiOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-xl p-4"
                      >
                        {notifications.map(n => (
                          <div key={n.id} className="p-3 hover:bg-ivory rounded-2xl">
                            <p className="text-sm">{n.text}</p>
                            <span className="text-xs text-gray-400">{n.time}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Chat (유지) */}
                <Link
                  to="/chat"
                  className={cn(
                    'relative p-2',
                    location.pathname === '/chat'
                      ? 'text-coral'
                      : 'text-gray-sub'
                  )}
                >
                  <MessageCircle size={24} />
                  {hasNewChat && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-coral rounded-full" />
                  )}
                </Link>

                {/* Profile */}
                <Link to="/profile" className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-coral/10 overflow-hidden">
                    <img
                      src={user.imgUrl || DEFAULT_PROFILE_IMAGE_URL}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="hidden lg:flex flex-col">
                    <span className="text-sm font-bold">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-coral">
                      {roleLabel[role]}
                    </span>
                  </div>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 border-2 border-coral text-coral rounded-2xl hover:bg-coral hover:text-white flex items-center gap-2"
                >
                  <LogOut size={18} />
                  로그아웃
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="px-5 py-2 text-gray-600 font-bold hover:text-coral transition-all">
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 bg-coral text-white rounded-2xl"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(v => !v)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="p-4 space-y-3">
              {finalNavItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2"
                >
                  {item.name}
                </Link>
              ))}

              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-3 border border-coral text-coral rounded-2xl"
                >
                  로그아웃
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block py-3 text-center bg-coral text-white rounded-2xl"
                >
                  로그인
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
