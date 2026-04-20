import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Shield, MapPin, Loader2, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { REGIONS } from '@/src/constants';
import axios from 'axios';
import { formatPhoneNumber, stripPhoneNumber } from '@/src/lib/phone';
import DatePicker from '@/src/components/DatePicker';

export default function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    birth: '',
    addr: '',
    district: '',
    phone: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const [isVerified, setIsVerified] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [showPassPopup, setShowPassPopup] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextValue = name === 'phone' ? formatPhoneNumber(value) : value;
    setFormData(prev => ({ ...prev, [name]: nextValue }));

    // Real-time validation
    if (name === 'email') {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(value) ? '' : '올바른 이메일 형식이 아닙니다.'
      }));
    }

    if (name === 'password') {
      setErrors(prev => ({
        ...prev,
        password: value.length >= 8 ? '' : '비밀번호는 8자리 이상이어야 합니다.'
      }));
    }

    if (name === 'passwordConfirm' || name === 'password') {
      const pass = name === 'password' ? value : formData.password;
      const confirm = name === 'passwordConfirm' ? value : formData.passwordConfirm;
      setErrors(prev => ({
        ...prev,
        passwordConfirm: pass === confirm ? '' : '비밀번호가 일치하지 않습니다.'
      }));
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      if (!event.origin.endsWith('.run.app') && !event.origin.includes('localhost')) {
        return;
      }

      if (event.data?.type === 'KAKAO_AUTH_SUCCESS') {
        handleCustomTokenSignUp(event.data.token);
      } else if (event.data?.type === 'KAKAO_AUTH_ERROR') {
        alert('카카오 가입에 실패했습니다.');
        setIsSocialLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);

    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      handleCustomTokenSignUp(token);
    } else if (error) {
      alert('가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      navigate('/signup', { replace: true });
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [location]);



  const handlePassVerify = () => {
    setShowPassPopup(true);
  };

  const confirmPassVerify = () => {
    setIsVerified(true);
    setShowPassPopup(false);
    alert('본인인증이 완료되었습니다.');
  };


//소셜 로그인 임시 alert
const handleSocialSignUp = (provider: string) => {
  alert(`${provider} 소셜 회원가입은 준비 중입니다.`);
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.birth) {
    alert('생년월일을 선택해주세요.');
    return;
  }

    const requestData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      passwordConfirm: formData.passwordConfirm,
      birth: formData.birth,
    phone: stripPhoneNumber(formData.phone),
      addr: formData.addr,
      addr2: formData.district,
    };

  try {
    const response = await axios.post(
      "http://localhost:8080/api/auth/signup",
      requestData
    );

    console.log("회원가입 성공:", response.data);

    alert("회원가입 완료");
    navigate("/login");
  } catch (error: any) {
    console.error("회원가입 실패:", error);
    alert(error.response?.data?.message || "회원가입 중 오류 발생");
  }
};
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12 bg-ivory">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-coral/5"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">반가워요!</h1>
          <p className="text-gray-sub">포근한 취미 생활을 시작해볼까요?</p>
        </div>

        {/* Social Sign-up */}
        <div className="mb-10">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button 
              onClick={() => handleSocialSignUp('kakao')}
              disabled={isSocialLoading}
              className="py-4 bg-[#FEE500] text-[#3c1e1e] font-bold rounded-2xl flex items-center justify-center hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
            >
              <span className="w-6 h-6 bg-[#3c1e1e] rounded-full flex items-center justify-center text-[12px] text-[#FEE500]">K</span>
            </button>
            <button 
              onClick={() => handleSocialSignUp('naver')}
              disabled={isSocialLoading}
              className="py-4 bg-[#03C75A] text-white font-bold rounded-2xl flex items-center justify-center hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
            >
              <span className="text-xl">N</span>
            </button>
            <button 
              onClick={() => handleSocialSignUp('google')}
              disabled={isSocialLoading}
              className="py-4 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-2xl flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">또는 이메일로 가입</span>
            </div>
          </div>
        </div>

        {/* Manual Sign-up Form */}
        <form onSubmit={handleSubmit} method="POST" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">이름</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  name="name"
                  type="text" 
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="이름을 입력해주세요"
                  className="w-full pl-12 pr-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">이메일</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  name="email"
                  type="email" 
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className={cn(
                    "w-full pl-12 pr-6 py-4 bg-ivory rounded-2xl border-2 outline-none transition-all",
                    errors.email ? "border-red-400" : "border-transparent focus:border-coral"
                  )}
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 ml-2">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  name="password"
                  type="password" 
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="8자리 이상 입력"
                  className={cn(
                    "w-full pl-12 pr-6 py-4 bg-ivory rounded-2xl border-2 outline-none transition-all",
                    errors.password ? "border-red-400" : "border-transparent focus:border-coral"
                  )}
                />
              </div>
              {errors.password && <p className="text-[10px] text-red-500 ml-2">{errors.password}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">비밀번호 확인</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  name="passwordConfirm"
                  type="password" 
                  required
                  value={formData.passwordConfirm}
                  onChange={handleInputChange}
                  placeholder="비밀번호 재입력"
                  className={cn(
                    "w-full pl-12 pr-6 py-4 bg-ivory rounded-2xl border-2 outline-none transition-all",
                    errors.passwordConfirm ? "border-red-400" : "border-transparent focus:border-coral"
                  )}
                />
              </div>
              {errors.passwordConfirm && <p className="text-[10px] text-red-500 ml-2">{errors.passwordConfirm}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">생년월일</label>
              <DatePicker
                value={formData.birth}
                onChange={(value) => setFormData(prev => ({ ...prev, birth: value }))}
                placeholder="생년월일을 선택해주세요"
                disableFuture
                placement="top"
                panelClassName="min-h-[392px] w-[320px] max-w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">전화번호</label>
              <input 
                name="phone"
                type="tel" 
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="010-0000-0000"
                className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">활동 지역</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select 
                  name="addr"
                  required
                  value={formData.addr}
                  onChange={(e) => setFormData(prev => ({ ...prev, addr: e.target.value, district: '' }))}
                  className="w-full pl-12 pr-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">시/도 선택</option>
                  {REGIONS.map(region => (
                    <option key={region.name} value={region.name}>{region.name}</option>
                  ))}
                </select>
              </div>
              <select 
                name="district"
                required
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                disabled={!formData.addr}
                className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">시/군/구 선택</option>
                {REGIONS.find(r => r.name === formData.addr)?.districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-gray-400 ml-2">활동 지역은 마이페이지에서 언제든 수정할 수 있습니다.</p>
          </div>

          <div className="pt-4">
            <button 
              type="button"
              onClick={handlePassVerify}
              disabled={isVerified}
              className={cn(
                "w-full py-4 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all mb-4",
                isVerified 
                  ? "bg-green-50 text-green-600 border-2 border-green-200" 
                  : "bg-gray-900 text-white hover:bg-gray-800"
              )}
            >
              {isVerified ? <CheckCircle2 size={18} /> : <Shield size={18} />}
              {isVerified ? '본인인증 완료' : 'PASS 본인인증'}
            </button>

            <button 
              type="submit"
              disabled={!isVerified}
              className={cn(
                "w-full py-5 text-white font-bold rounded-3xl transition-all shadow-xl text-lg",
                isVerified 
                  ? "bg-coral hover:bg-coral/90 shadow-coral/30" 
                  : "bg-gray-200 cursor-not-allowed shadow-none"
              )}
            >
              가입하기
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-sm text-gray-500">
          이미 계정이 있으신가요? <Link to="/login" className="text-coral font-bold hover:underline">로그인</Link>
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

      {/* PASS Mock Popup */}
      <AnimatePresence>
        {showPassPopup && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPassPopup(false)}
              className="absolute inset-0 bg-black/40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="bg-[#E61E28] p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">PASS 본인인증</h3>
                <button onClick={() => setShowPassPopup(false)}><X size={24} /></button>
              </div>
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield size={32} className="text-[#E61E28]" />
                </div>
                <p className="text-gray-900 font-bold text-lg mb-2">간편인증을 진행하시겠습니까?</p>
                <p className="text-gray-500 text-sm mb-8">안전하고 간편하게 본인인증을 완료하세요.</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowPassPopup(false)}
                    className="py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                  >
                    취소
                  </button>
                  <button 
                    onClick={confirmPassVerify}
                    className="py-4 bg-[#E61E28] text-white font-bold rounded-2xl hover:bg-[#C11922] transition-all"
                  >
                    확인
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
