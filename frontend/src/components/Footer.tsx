import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { getFreelancerApplicationStatus } from '@/src/api/freelancerRegistration';
import {
  clearStoredFreelancerApplicationStatus,
  getStoredFreelancerApplicationStatus,
  setStoredFreelancerApplicationStatus,
} from '@/src/lib/freelancerApplication';

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
    <footer className="border-t border-white/10 bg-[#16191C] pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="mb-[15px] mr-6 flex shrink-0 items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-coral/10 bg-white shadow-md">
                <img
                  src="/pognLogo.png"
                  alt="Pogeun Logo"
                  className="h-full w-full object-contain p-1"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight text-coral">포근</span>
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              당신의 일상에 새로운 취미를 더해줄
              <br />
              검증된 전문가와 연결되는 취미 매칭 플랫폼
            </p>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-white">서비스</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <Link to="/browse" className="transition-colors hover:text-coral">
                  클래스 찾기
                </Link>
              </li>
              {isUser && !hasPendingFreelancerApplication && (
                <li>
                  <Link to="/expert-register" className="transition-colors hover:text-coral">
                    전문가 등록
                  </Link>
                </li>
              )}
              <li>
                <Link to="/reviews" className="transition-colors hover:text-coral">
                  이용 리뷰
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-white">고객센터</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <Link to="/notices" className="transition-colors hover:text-coral">
                  공지사항
                </Link>
              </li>
              <li>
                <Link to="/faq" className="transition-colors hover:text-coral">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link to="/chat?adminInquiry=true" className="transition-colors hover:text-coral">
                  1:1 문의
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-white">Contact</h4>
            <p className="mb-2 text-sm text-gray-400">서울특별시 강남구 테헤란로 123</p>
            <p className="mb-2 text-sm text-gray-400">support@pogeun.com</p>
            <p className="text-sm text-gray-400">02-1234-5678</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <div className="flex gap-6 text-xs text-gray-500">
            <Link to="/terms" className="hover:text-white">
              이용약관
            </Link>
            <Link to="/privacy" className="font-bold hover:text-white">
              개인정보처리방침
            </Link>
            <Link to="/location" className="hover:text-white">
              위치기반서비스 이용약관
            </Link>
          </div>
          <p className="text-xs text-gray-500">© 2024 Pogeun. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
