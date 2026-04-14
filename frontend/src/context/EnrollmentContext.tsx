import React, { createContext, useContext, useState, ReactNode } from 'react';
import { EnrollmentItem, MOCK_ENROLLMENTS, EnrollmentStatus } from '../constants';

interface EnrollmentContextType {
  enrollments: EnrollmentItem[];
  applyForClass: (classId: string, classTitle: string, price: number) => void;
  updateEnrollmentStatus: (enrollmentId: string, status: EnrollmentStatus, reason?: string) => void;
}

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>(MOCK_ENROLLMENTS);

  const applyForClass = (classId: string, classTitle: string, price: number) => {
    const newEnrollment: EnrollmentItem = {
      id: `e${Date.now()}`,
      classId,
      classTitle,
      studentName: '포근한 사용자', // Demo user
      studentEmail: 'user@example.com',
      status: 'PENDING',
      appliedAt: new Date().toISOString().split('T')[0],
      price,
    };
    setEnrollments((prev) => [newEnrollment, ...prev]);
  };

  const updateEnrollmentStatus = (enrollmentId: string, status: EnrollmentStatus, reason?: string) => {
    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === enrollmentId ? { ...e, status, cancelReason: reason } : e
      )
    );
  };

  return (
    <EnrollmentContext.Provider value={{ enrollments, applyForClass, updateEnrollmentStatus }}>
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
