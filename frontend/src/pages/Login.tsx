import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Shield} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import apiClient from '@/src/api/axios';
import { useAuth } from "@/src/context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

const [isSocialLoading, setIsSocialLoading] = useState(false);

  useEffect(() => {
  }, [location]);

const handleSocialLogin = (provider: string) => {
  alert(`${provider} 소셜 로그인은 현재 준비 중입니다.`);
};

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      alert('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 bg-ivory">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-coral/5"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-coral/10 rounded-2xl mb-6">
            <img 
              src="https://github.com/lei-3m/AIBE5/blob/main/img/pogeunLogo.png?raw=true" 
              alt="Pogeun Logo" 
              className="w-10 h-10 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">다시 오셨군요!</h1>
          <p className="text-gray-sub">포근한 일상을 다시 시작해볼까요?</p>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button 
            onClick={() => handleSocialLogin('카카오')}
            disabled={isSocialLoading}
            className="py-4 bg-[#FEE500] text-[#3c1e1e] font-bold rounded-2xl flex items-center justify-center hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
          >
            <span className="w-6 h-6 bg-[#3c1e1e] rounded-full flex items-center justify-center text-[12px] text-[#FEE500]">K</span>
          </button>
          <button 
            onClick={() => handleSocialLogin('네이버')}
            disabled={isSocialLoading}
            className="py-4 bg-[#03C75A] text-white font-bold rounded-2xl flex items-center justify-center hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
          >
            <span className="text-xl">N</span>
          </button>
          <button 
            onClick={() => handleSocialLogin('구글')}
            disabled={isSocialLoading}
            className="py-4 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400">또는 이메일로 로그인</span>
          </div>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit} method="POST" className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">이메일</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                className="w-full pl-12 pr-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="비밀번호를 입력해주세요"
                className="w-full pl-12 pr-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 px-1">
            <button type="button" onClick={() => alert('ID 찾기 페이지로 이동합니다.')} className="text-xs text-gray-400 hover:text-coral transition-colors">ID 찾기</button>
            <div className="w-[1px] h-3 bg-gray-200 self-center"></div>
            <button type="button" onClick={() => alert('비밀번호 찾기 페이지로 이동합니다.')} className="text-xs text-gray-400 hover:text-coral transition-colors">비밀번호 찾기</button>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-coral text-white font-bold rounded-3xl hover:bg-coral/90 transition-all shadow-xl shadow-coral/30 mt-4 text-lg"
          >
            로그인하기
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-500">
          계정이 없으신가요? <Link to="/signup" className="text-coral font-bold hover:underline">회원가입</Link>
        </p>
      </motion.div>

      {/* Social Loading Overlay */}
      <AnimatePresence>
        {isSocialLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-10 rounded-[40px] shadow-2xl flex flex-col items-center text-center max-w-xs mx-4"
            >
              <div className="relative w-20 h-20 mb-6">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 border-4 border-coral/10 border-t-coral rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="text-coral animate-pulse" size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">안전하게 연결 중</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                소셜 계정 정보를 가져오고 있습니다.<br />
                잠시만 기다려주세요.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
