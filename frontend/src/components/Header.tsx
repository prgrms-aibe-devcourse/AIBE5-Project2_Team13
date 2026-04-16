import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, User, Menu, X, MessageCircle, LogOut, BadgeCheck, Search } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [hasNewNoti, setHasNewNoti] = useState(true);
  const [hasNewChat, setHasNewChat] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
      setUserRole(localStorage.getItem('userRole'));
    };
    checkLogin();
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserRole(null);
    alert('성공적으로 로그아웃되었습니다!');
    navigate('/');
  };

  const navItems = [
    { name: 'AI 추천', path: '/ai-recommend' },
    { name: '클래스 찾기', path: '/browse' },
    { name: '클래스 요청', path: '/requests' },
    ...((!userRole || userRole === 'ROLE_USER') ? [{ name: '프리랜서 등록', path: '/expert-register' }] : []),
  ];

  const notifications = [
    { id: 1, text: '새로운 추천 클래스가 도착했어요!', time: '5분 전' },
    { id: 2, text: '요청하신 클래스에 댓글이 달렸습니다.', time: '1시간 전' },
    { id: 3, text: '포근 서비스에 오신 것을 환영합니다!', time: '1일 전' },
  ];

  const handleNotiClick = () => {
    setIsNotiOpen(!isNotiOpen);
    setHasNewNoti(false);
  };

  const handleChatClick = () => {
    setHasNewChat(false);
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
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-2xl font-bold text-coral tracking-tight">포근</span>
          </Link>

          {/* Search Bar - Half width, next to logo */}
          <div className="hidden md:flex w-full max-w-[180px] mr-4 shrink-0">
            <div className="relative w-full group">
              <input 
                type="text" 
                placeholder="검색"
                className="w-full h-10 pl-10 pr-4 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-coral/20 focus:bg-white transition-all outline-none"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-coral transition-colors" size={16} />
            </div>
          </div>

          {/* Desktop Navigation - Centered in remaining space */}
          <nav className="hidden md:flex flex-1 justify-center items-center gap-6 px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-base font-medium transition-colors hover:text-coral whitespace-nowrap",
                  location.pathname === item.path ? "text-coral" : "text-gray-sub"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            {isLoggedIn ? (
              <>
                <div className="relative">
                  <button 
                    onClick={handleNotiClick}
                    className="p-2 text-gray-sub hover:text-coral transition-colors relative"
                  >
                    <Bell size={24} />
                    {hasNewNoti && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-coral rounded-full border-2 border-ivory"></span>
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {isNotiOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-xl border border-coral/10 p-4 overflow-hidden"
                      >
                        <h3 className="font-bold text-gray-900 mb-3 px-2">알림</h3>
                        <div className="space-y-2">
                          {notifications.map((noti) => (
                            <div key={noti.id} className="p-3 hover:bg-ivory rounded-2xl transition-colors cursor-pointer">
                              <p className="text-sm text-gray-900">{noti.text}</p>
                              <span className="text-xs text-gray-400">{noti.time}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link 
                  to="/chat" 
                  onClick={handleChatClick}
                  className={cn(
                    "p-2 transition-colors relative",
                    location.pathname === '/chat' ? "text-coral" : "text-gray-sub hover:text-coral"
                  )}
                >
                  <MessageCircle size={24} />
                  {hasNewChat && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-coral rounded-full border-2 border-ivory"></span>
                  )}
                </Link>

                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="w-10 h-10 rounded-full bg-coral/10 border-2 border-coral/20 flex items-center justify-center overflow-hidden group-hover:border-coral transition-all">
                    <img 
                      src={userRole === 'ROLE_ADMIN' ? "https://picsum.photos/seed/admin/100/100" : "https://picsum.photos/seed/pogeun-expert/100/100"} 
                      alt="User" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="hidden lg:flex flex-col items-start -space-y-1">
                    <span className="text-sm font-bold text-gray-900">
                      {userRole === 'ROLE_ADMIN' ? '관리자' : userRole === 'ROLE_FREELANCER' ? '포근프리랜서' : '포근사용자'}
                    </span>
                    <span className="text-[10px] font-medium text-coral">
                      {userRole === 'ROLE_ADMIN' ? 'ADMIN' : userRole === 'ROLE_FREELANCER' ? 'FREELANCER' : 'USER'}
                    </span>
                  </div>
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="px-5 py-2 bg-white text-coral border-2 border-coral font-bold rounded-2xl hover:bg-coral hover:text-white transition-all flex items-center gap-2"
                >
                  <LogOut size={18} /> 로그아웃
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login"
                  className="px-5 py-2 text-gray-600 font-bold hover:text-coral transition-all"
                >
                  로그인
                </Link>
                <Link 
                  to="/signup"
                  className="px-5 py-2 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all shadow-lg shadow-coral/20"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-sub hover:text-coral transition-colors"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-coral/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-lg font-medium text-gray-sub hover:text-coral hover:bg-ivory rounded-2xl transition-all"
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-coral/10 flex flex-col gap-3">
                {isLoggedIn ? (
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-3 bg-white text-coral border-2 border-coral font-bold rounded-2xl text-center flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} /> 로그아웃
                  </button>
                ) : (
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full py-3 bg-coral text-white font-bold rounded-2xl text-center"
                  >
                    로그인
                  </Link>
                )}
                <Link 
                  to="/signup" 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-3 bg-white text-coral border-2 border-coral font-bold rounded-2xl text-center"
                >
                  회원가입
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
