import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Award, Users, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { getFreelancerApplicationStatus } from '@/src/api/freelancerRegistration';
import { useEffect } from 'react';
import { getStoredFreelancerApplicationStatus, setStoredFreelancerApplicationStatus, clearStoredFreelancerApplicationStatus } from '@/src/lib/freelancerApplication';

export default function ExpertRegister() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, loading } = useAuth();
  const isMember = user?.role === 'USER';
  const [hasPendingFreelancerApplication, setHasPendingFreelancerApplication] = useState(false);

  const handleRegister = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!isMember) {
      setHasPendingFreelancerApplication(false);
      clearStoredFreelancerApplicationStatus();
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
  }, [isMember]);

  if (loading) {
    return null;
  }

  if (!isMember) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="bg-white rounded-[40px] p-10 border border-coral/10 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">프리랜서 등록은 회원만 신청할 수 있습니다.</h1>
          <p className="text-gray-500 mb-8">회원 계정으로 로그인한 뒤 프리랜서 등록을 진행해주세요.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  if (hasPendingFreelancerApplication) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="bg-white rounded-[40px] p-10 border border-coral/10 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">프리랜서 등록 심사 중입니다.</h1>
          <p className="text-gray-500 mb-8">현재 신청이 승인 대기 상태라 추가 신청은 할 수 없습니다.</p>
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-3 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all"
          >
            마이페이지로 이동
          </button>
        </div>
      </div>
    );
  }

  const benefits = [
    { icon: <Award className="text-coral" />, title: '전문성 인증', desc: '포근의 검증 시스템을 통해 당신의 실력을 인증받으세요.' },
    { icon: <Users className="text-coral" />, title: '수많은 수강생', desc: '매일 수천 명의 사용자가 새로운 취미를 찾고 있습니다.' },
    { icon: <ShieldCheck className="text-coral" />, title: '안전한 결제', desc: '정산 걱정 없이 클래스 운영에만 집중하세요.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="inline-block px-4 py-1.5 bg-coral/10 text-coral font-bold rounded-full text-sm mb-6">
            포근 프리랜서 파트너십
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-8">
            당신의 재능을 <br />
            세상과 나누고 <br />
            <span className="text-coral">수익</span>을 창출하세요.
          </h1>
          <p className="text-lg text-gray-sub mb-10 leading-relaxed">
            포근은 프리랜서분들이 자신의 재능을 가장 빛낼 수 있는 환경을 제공합니다. <br />
            지금 바로 등록하고 새로운 수강생들을 만나보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/expert-register/form')}
              className="px-8 py-4 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all shadow-lg shadow-coral/20"
            >
              프리랜서 등록 신청하기
            </button>
            <button 
              onClick={handleRegister}
              className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl border-2 border-coral/10 hover:border-coral transition-all"
            >
              가이드북 다운로드
            </button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-coral/5 rounded-[60px] blur-2xl"></div>
          <img
            src="https://picsum.photos/seed/expert/800/600"
            alt="Expert"
            className="relative rounded-[40px] shadow-2xl"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {benefits.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="p-10 bg-white rounded-3xl border border-coral/10 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="w-14 h-14 bg-coral/10 rounded-2xl flex items-center justify-center mb-6">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
            <p className="text-gray-sub leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <section className="bg-coral rounded-[40px] p-12 md:p-20 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">지금 바로 시작해보세요!</h2>
          <p className="text-white/80 mb-10 text-lg">간단한 정보 입력만으로 프리랜서 등록이 가능합니다.</p>
          <button 
            onClick={() => navigate('/expert-register/form')}
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-coral font-bold rounded-2xl hover:bg-ivory transition-all shadow-xl text-lg"
          >
            등록 폼 작성하기 <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Success Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] p-10 text-center shadow-2xl"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-coral transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="inline-flex items-center justify-center w-20 h-20 bg-coral/10 text-coral rounded-full mb-6">
                <CheckCircle2 size={48} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">가이드북 발송 완료!</h2>
              <p className="text-gray-600 mb-10 leading-relaxed">
                포근 프리랜서 가이드북이 <br />
                메일로 발송되었습니다.
              </p>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-5 bg-coral text-white font-bold rounded-3xl hover:bg-coral/90 transition-all shadow-xl shadow-coral/30 text-lg"
              >
                확인
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
