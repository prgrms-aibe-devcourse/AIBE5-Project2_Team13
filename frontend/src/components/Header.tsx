import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, Menu, X, MessageCircle, LogOut, Search, CheckCheck, Trash2,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext';
import apiClient from '@/src/api/axios';
import { getChatRooms } from '@/src/api/chat';
import { DEFAULT_PROFILE_IMAGE_URL } from '@/src/lib/profileImage';
import { getFreelancerApplicationStatus } from '@/src/api/freelancerRegistration';
import {
  clearStoredFreelancerApplicationStatus,
  getStoredFreelancerApplicationStatus,
  setStoredFreelancerApplicationStatus,
} from '@/src/lib/freelancerApplication';

// ─── 알림 타입 ───────────────────────────────────────────────
interface NotificationItem {
  id: number;
  type: string;
  content: string;
  relatedLink: string | null;
  isRead: boolean;
  createdAt: string;
}
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min  = Math.floor(diff / 60000);
  const hour = Math.floor(diff / 3600000);
  const day  = Math.floor(diff / 86400000);
  if (min  < 1)  return '방금 전';
  if (min  < 60) return `${min}분 전`;
  if (hour < 24) return `${hour}시간 전`;
  return `${day}일 전`;
}
// ─────────────────────────────────────────────────────────────

type Role = 'ADMIN' | 'FREELANCER' | 'USER';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen]   = useState(false);
  const [isNotiOpen, setIsNotiOpen]   = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewChat, setHasNewChat]   = useState(false);
  const [hasPendingFreelancerApplication, setHasPendingFreelancerApplication] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);

  const { user, logout, loading } = useAuth();
  const isLoggedIn = !loading && !!user;
  const location   = useLocation();
  const navigate   = useNavigate();
  const role       = (user?.role as Role) ?? 'USER';

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedKeyword = searchKeyword.trim();
    if (!trimmedKeyword) {
      navigate('/search');
      return;
    }

    navigate(`/search?q=${encodeURIComponent(trimmedKeyword)}`);
  };

  // ─── 알림 목록 조회 — 로그인 상태 변경 시에만 (페이지 이동 시 덮어쓰지 않음) ──
  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const load = async () => {
      try {
        const [notiRes, unreadRes] = await Promise.all([
          apiClient.get<NotificationItem[]>('/notifications'),
          apiClient.get<{ count: number }>('/notifications/unread'),
        ]);
        setNotifications(notiRes.data);
        setUnreadCount(unreadRes.data.count);
      } catch {
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    load();
  }, [isLoggedIn]); // ← location.pathname 제거: 페이지 이동 시 덮어쓰기 방지

  // ─── 읽지 않은 수만 페이지 이동마다 갱신 (목록은 건드리지 않음) ──────────
  useEffect(() => {
    if (!isLoggedIn) return;
    apiClient.get<{ count: number }>('/notifications/unread')
      .then(res => setUnreadCount(res.data.count))
      .catch(() => {});
  }, [isLoggedIn, location.pathname]);

  // ─── 드롭다운 외부 클릭 시 닫기 ───────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) {
        setIsNotiOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── 프리랜서 등록 신청 상태 ───────────────────────────────
  useEffect(() => {
    if (!isLoggedIn || role !== 'USER') {
      setHasPendingFreelancerApplication(false);
      if (role !== 'USER') clearStoredFreelancerApplicationStatus();
      return;
    }

    let isMounted = true;
    setHasPendingFreelancerApplication(getStoredFreelancerApplicationStatus() === 'W');

    getFreelancerApplicationStatus()
      .then((status) => {
        if (!isMounted) return;
        if (status.approvalStatusCode) {
          setStoredFreelancerApplicationStatus(status.approvalStatusCode);
        } else {
          clearStoredFreelancerApplicationStatus();
        }
        setHasPendingFreelancerApplication(status.approvalStatusCode === 'W');
      })
      .catch(() => {
        if (isMounted) setHasPendingFreelancerApplication(false);
      });

    return () => { isMounted = false; };
  }, [isLoggedIn, role, location.pathname]);

  // ─── 채팅 읽지 않은 메시지 표시 ───────────────────────────
  useEffect(() => {
    if (!isLoggedIn) {
      setHasNewChat(false);
      return;
    }
    let isMounted = true;
    getChatRooms()
      .then((rooms) => {
        if (isMounted) setHasNewChat(rooms.some((room) => room.unreadCount > 0));
      })
      .catch(() => {
        if (isMounted) setHasNewChat(false);
      });
    return () => { isMounted = false; };
  }, [isLoggedIn, location.pathname]);

  useEffect(() => {
    const handleUnreadUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ hasUnread?: boolean }>;
      setHasNewChat(customEvent.detail?.hasUnread === true);
    };
    window.addEventListener('chat-unread-updated', handleUnreadUpdate as EventListener);
    return () => window.removeEventListener('chat-unread-updated', handleUnreadUpdate as EventListener);
  }, []);

  // ─── 알림 핸들러 ──────────────────────────────────────────
  const handleNotiClick = () => setIsNotiOpen(v => !v);

  /** 알림 단건 클릭 — 읽음 처리 완전히 완료 후 이동 */
  const handleNotiItemClick = async (noti: NotificationItem) => {
    setIsNotiOpen(false);

    // 읽음 처리를 먼저 완전히 완료한 뒤 페이지 이동
    // (이동 전에 await 처리하지 않으면 요청이 중간에 끊겨 읽음 상태가 저장 안 됨)
    if (!noti.isRead) {
      try {
        await apiClient.patch(`/notifications/${noti.id}/read`);
        setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch { }
    }

    if (noti.relatedLink) navigate(noti.relatedLink);
  };

  /** 전체 읽음 처리 */
  const handleMarkAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { }
  };

  /** 단건 삭제 — X 버튼 */
  const handleDeleteNoti = async (e: React.MouseEvent, notiId: number) => {
    e.stopPropagation(); // 부모(알림 클릭) 이벤트 전파 차단
    try {
      await apiClient.delete(`/notifications/${notiId}`);
      const deleted = notifications.find(n => n.id === notiId);
      setNotifications(prev => prev.filter(n => n.id !== notiId));
      // 삭제한 알림이 읽지 않은 상태였으면 카운트도 감소
      if (deleted && !deleted.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { }
  };

  /** 전체 삭제 — 휴지통 버튼 */
  const handleDeleteAllNoti = async () => {
    try {
      await apiClient.delete('/notifications');
      setNotifications([]);
      setUnreadCount(0);
    } catch { }
  };

  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logout();
      navigate('/');
    }
  };

  // ─── 네비게이션 ───────────────────────────────────────────
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
    ADMIN: '관리자', FREELANCER: '프리랜서', USER: '회원',
  };

  if (loading) {
    return <header className="sticky top-0 z-50 w-full bg-ivory/80 backdrop-blur-md border-b border-coral/10" />;
  }

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
            <form className="relative w-full" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="검색"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-coral/20 outline-none"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </form>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex flex-1 justify-center gap-6">
            {finalNavItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'text-base font-medium hover:text-coral',
                  location.pathname === item.path ? 'text-coral' : 'text-gray-sub'
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
                {/* 알림 */}
                <div className="relative" ref={notiRef}>
                  <button onClick={handleNotiClick} className="relative p-2 text-gray-sub hover:text-coral">
                    <Bell size={24} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotiOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-xl overflow-hidden border border-coral/10"
                      >
                        {/* 드롭다운 헤더 */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                          <span className="font-bold text-gray-900 text-sm">알림</span>
                          <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                              <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1 text-xs text-coral hover:underline"
                              >
                                <CheckCheck size={13} />
                                모두 읽음
                              </button>
                            )}
                            {notifications.length > 0 && (
                              <button
                                onClick={handleDeleteAllNoti}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
                                title="전체 삭제"
                              >
                                <Trash2 size={13} />
                                전체 삭제
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 알림 목록 */}
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="py-10 text-center text-sm text-gray-400">
                              새로운 알림이 없어요.
                            </div>
                          ) : (
                            notifications.map(n => (
                              <div
                                key={n.id}
                                className={cn(
                                  "relative flex items-start gap-2 px-4 py-3 border-b border-gray-50 last:border-0 group",
                                  !n.isRead ? "bg-coral/5" : "bg-white"
                                )}
                              >
                                <button
                                  onClick={() => handleNotiItemClick(n)}
                                  className="flex-1 text-left hover:bg-ivory/50 transition-colors rounded-lg"
                                >
                                  <div className="flex items-start gap-2">
                                    {!n.isRead && (
                                      <span className="mt-1.5 w-2 h-2 bg-coral rounded-full shrink-0" />
                                    )}
                                    <div className={cn(!n.isRead ? "" : "ml-4")}>
                                      <p className="text-sm text-gray-800 leading-snug">{n.content}</p>
                                      <span className="text-xs text-gray-400 mt-0.5 block">
                                        {timeAgo(n.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                </button>

                                {/* X 버튼 — 단건 삭제 */}
                                <button
                                  onClick={(e) => handleDeleteNoti(e, n.id)}
                                  className="shrink-0 p-1 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                  title="알림 삭제"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 채팅 */}
                <Link
                  to="/chat"
                  className={cn('relative p-2', location.pathname === '/chat' ? 'text-coral' : 'text-gray-sub')}
                >
                  <MessageCircle size={24} />
                  {hasNewChat && <span className="absolute top-1 right-1 w-2 h-2 bg-coral rounded-full" />}
                </Link>

                {/* 프로필 */}
                <Link to="/profile" className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-coral/10 overflow-hidden">
                    <img src={user.imgUrl || DEFAULT_PROFILE_IMAGE_URL} className="w-full h-full object-cover" />
                  </div>
                  <div className="hidden lg:flex flex-col">
                    <span className="text-sm font-bold">{user.name}</span>
                    <span className="text-[10px] text-coral">{roleLabel[role]}</span>
                  </div>
                </Link>

                {/* 로그아웃 */}
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
                <Link to="/signup" className="px-5 py-2 bg-coral text-white rounded-2xl">
                  회원가입
                </Link>
              </div>
            )}
          </div>

          {/* 모바일 토글 */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(v => !v)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
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
                <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className="block py-2">
                  {item.name}
                </Link>
              ))}
              {user ? (
                <button onClick={handleLogout} className="w-full py-3 border border-coral text-coral rounded-2xl">
                  로그아웃
                </button>
              ) : (
                <Link to="/login" className="block py-3 text-center bg-coral text-white rounded-2xl">
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
