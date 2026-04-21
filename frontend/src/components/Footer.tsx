import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { getFreelancerApplicationStatus } from '@/src/api/freelancerRegistration';
import { clearStoredFreelancerApplicationStatus, getStoredFreelancerApplicationStatus, setStoredFreelancerApplicationStatus } from '@/src/lib/freelancerApplication';

export default function Footer() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [hasPendingFreelancerApplication, setHasPendingFreelancerApplication] = useState(false);
  const isUser = !loading && user?.role === 'USER';

  useEffect(() => {
    if (!isUser) {
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
  }, [isUser, location.pathname]);

  return (
    <footer className="bg-white pt-20 pb-10 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mr-6 shrink-0 mb-[15px]">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-coral/10 overflow-hidden">
                <img
                    src="https://github.com/lei-3m/AIBE5/blob/main/img/pogeunLogo.png?raw=true"
                    alt="Pogeun Logo"
                    className="w-full h-full object-contain p-1"
                />
              </div>
              <span className="text-2xl font-bold text-coral tracking-tight">포근</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              당신의 일상에 따뜻한 취미를 더하다.<br />
              검증된 전문가와 함께하는 취미 매칭 플랫폼
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-6">서비스</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/browse" className="hover:text-coral transition-colors">클래스 찾기</Link></li>
              {isUser && !hasPendingFreelancerApplication && <li><Link to="/expert-register" className="hover:text-coral transition-colors">전문가 등록</Link></li>}
              <li><Link to="/reviews" className="hover:text-coral transition-colors">이용 리뷰</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-6">고객센터</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><Link to="/notices" className="hover:text-coral transition-colors">공지사항</Link></li>
              <li><Link to="/faq" className="hover:text-coral transition-colors">자주 묻는 질문</Link></li>
              <li><Link to="/chat?adminInquiry=true" className="hover:text-coral transition-colors">1:1 문의</Link></li>
              {/* 이제 footer는 관리자 이메일을 알지 않고, "관리자 문의 플래그"만 채팅 페이지로 넘깁니다. */}
              {/* footer 문의는 관리자 문의 의도만 넘기고, 실제 관리자 이메일 고정은 백엔드가 처리합니다. */}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Contact</h4>
            <p className="text-sm text-gray-500 mb-2">서울특별시 강남구 테헤란로 123</p>
            <p className="text-sm text-gray-500 mb-2">support@pogeun.com</p>
            <p className="text-sm text-gray-500">02-1234-5678</p>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6 text-xs text-gray-400">
            <Link to="/terms" className="hover:text-gray-600">이용약관</Link>
            <Link to="/privacy" className="hover:text-gray-600 font-bold">개인정보처리방침</Link>
            <Link to="/location" className="hover:text-gray-600">위치기반서비스 이용약관</Link>
          </div>
          <p className="text-xs text-gray-400">© 2024 Pogeun. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
