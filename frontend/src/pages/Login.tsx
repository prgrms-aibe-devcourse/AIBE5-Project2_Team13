import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Shield, User, Phone, CalendarDays, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAuth } from "@/src/context/AuthContext";
import axios from 'axios';
import { findEmail } from '@/src/api/auth';
import DatePicker from '@/src/components/DatePicker';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [toast, setToast] = useState<string | null>(null);
  const [isFindEmailModalOpen, setIsFindEmailModalOpen] = useState(false);
  const [findEmailForm, setFindEmailForm] = useState({
    name: '',
    phone: '',
    birth: '',
  });
  const [foundEmail, setFoundEmail] = useState<string | null>(null);
  const [isFindEmailLoading, setIsFindEmailLoading] = useState(false);

const [isSocialLoading, setIsSocialLoading] = useState(false);

  useEffect(() => {
  }, [location]);

const handleSocialLogin = (provider: string) => {
  alert(`${provider} 소셜 로그인은 현재 준비 중입니다.`);
};

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const resetFindEmailModal = () => {
    setIsFindEmailModalOpen(false);
    setFindEmailForm({
      name: '',
      phone: '',
      birth: '',
    });
    setFoundEmail(null);
    setIsFindEmailLoading(false);
  };

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message === '탈퇴한 계정입니다.') {
        showToast('탈퇴한 계정입니다.');
        return;
      }

      if (axios.isAxiosError(err) && (err.response?.status === 400 || err.response?.status === 401 || err.response?.status === 403)) {
        alert('이메일 또는 비밀번호가 올바르지 않습니다.');
        return;
      }

      alert('로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleFindEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!findEmailForm.name.trim() || !findEmailForm.phone.trim() || !findEmailForm.birth) {
      showToast('이름, 전화번호, 생년월일을 모두 입력해주세요.');
      return;
    }

    setIsFindEmailLoading(true);
    setFoundEmail(null);

    try {
      const response = await findEmail({
        name: findEmailForm.name.trim(),
        phone: findEmailForm.phone.trim(),
        birth: findEmailForm.birth,
      });

      setFoundEmail(response.email);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        showToast(err.response.data.message);
      } else {
        showToast('이메일 찾기 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsFindEmailLoading(false);
    }
  };

  const handleCopyEmail = async () => {
    if (!foundEmail) {
      return;
    }

    try {
      await navigator.clipboard.writeText(foundEmail);
      showToast('이메일이 복사되었습니다.');
    } catch {
      showToast('복사에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <>
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
              <button type="button" onClick={() => setIsFindEmailModalOpen(true)} className="text-xs text-gray-400 hover:text-coral transition-colors">ID 찾기</button>
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

        <AnimatePresence>
          {isFindEmailModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4"
              onClick={resetFindEmailModal}
            >
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-gray-900">아이디 찾기</h2>
                  <p className="mt-2 text-sm text-gray-500">이름, 전화번호, 생년월일이 모두 일치하면 이메일을 알려드립니다.</p>
                </div>

                <form onSubmit={handleFindEmail} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">이름</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={findEmailForm.name}
                        onChange={(e) => setFindEmailForm({ ...findEmailForm, name: e.target.value })}
                        placeholder="이름을 입력해주세요"
                        className="w-full pl-12 pr-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">전화번호</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={findEmailForm.phone}
                        onChange={(e) => setFindEmailForm({ ...findEmailForm, phone: e.target.value })}
                        placeholder="전화번호를 입력해주세요"
                        className="w-full pl-12 pr-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">생년월일</label>
                    <DatePicker
                      value={findEmailForm.birth}
                      onChange={(value) => setFindEmailForm({ ...findEmailForm, birth: value })}
                      placeholder="생년월일을 선택해주세요"
                      disableFuture
                      placement="top"
                      panelClassName="min-h-[392px] w-[320px] max-w-full"
                    />
                  </div>

                  {foundEmail && (
                    <div className="rounded-3xl bg-coral/10 px-5 py-4">
                      <p className="text-xs font-bold text-coral">찾은 이메일</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="break-all text-sm font-semibold text-gray-900">{foundEmail}</p>
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm transition-colors hover:text-coral"
                        >
                          <Copy size={14} />
                          복사
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetFindEmailModal}
                      className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50"
                    >
                      닫기
                    </button>
                    <button
                      type="submit"
                      disabled={isFindEmailLoading}
                      className={cn(
                        "flex-1 rounded-2xl py-3 text-sm font-bold text-white transition-all",
                        isFindEmailLoading ? "bg-coral/60" : "bg-coral hover:bg-coral/90"
                      )}
                    >
                      {isFindEmailLoading ? '조회 중...' : '이메일 찾기'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
