import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { EnrollmentItem, EnrollmentStatus } from '../constants';
import { getMyClassOrders } from '@/src/api/classOrder';
import { getAccessToken } from '@/src/lib/auth';
import { useAuth } from './AuthContext';

interface EnrollmentContextType {
  enrollments: EnrollmentItem[];
  applyForClass: (classId: string, classTitle: string, price: number, orderId?: string) => void;
  updateEnrollmentStatus: (enrollmentId: string, status: EnrollmentStatus, reason?: string) => void;
  refreshEnrollments: () => Promise<void>;
}

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const { user } = useAuth();

  //마이페이지 데이터 갱신
  const refreshEnrollments = async () => {
    if (!getAccessToken()) { //비로그인
      setEnrollments([]);
      return;
    }
    try {
      const myOrders = await getMyClassOrders();
      setEnrollments(myOrders);
    } catch (error) {
      console.error('내 수강 신청 목록 조회 실패:', error);
    }
  };

  useEffect(() => {
    refreshEnrollments();
  }, [user]);

  const applyForClass = (classId: string, classTitle: string, price: number, orderId?: string) => {
    const newEnrollment: EnrollmentItem = {
      id: orderId ?? `e${Date.now()}`,
      classId,
      classTitle,
      studentName: user?.name || '포근한 사용자',
      studentEmail: user?.email || 'user@example.com',
      status: 'PENDING',
      appliedAt: new Date().toISOString().split('T')[0],
      price,
    };
    setEnrollments((prev) => {
      if (prev.some((item) => item.id === newEnrollment.id)) {
        return prev;
      }
      return [newEnrollment, ...prev];
    });
  };

  const updateEnrollmentStatus = (enrollmentId: string, status: EnrollmentStatus, reason?: string) => {
    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === enrollmentId ? { ...e, status, cancelReason: reason } : e
      )
    );
  };

  return (
    <EnrollmentContext.Provider value={{ enrollments, applyForClass, updateEnrollmentStatus, refreshEnrollments }}>
      {children}
    </EnrollmentContext.Provider>
  );
}

export function useEnrollments() {
  const context = useContext(EnrollmentContext);
  if (context === undefined) {
    throw new Error('useEnrollments must be used within an EnrollmentProvider');
  }
  return context;
}
