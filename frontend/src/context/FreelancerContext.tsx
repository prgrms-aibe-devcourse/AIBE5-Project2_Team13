import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_FREELANCER_PROFILES, FreelancerProfile, FreelancerApprovalRequest, MOCK_FREELANCER_APPROVALS } from '../constants';

interface FreelancerContextType {
  freelancers: FreelancerProfile[];
  approvals: FreelancerApprovalRequest[];
  updateFreelancer: (id: string, updatedProfile: Partial<FreelancerProfile>) => void;
  addApprovalRequest: (request: Omit<FreelancerApprovalRequest, 'id' | 'appliedAt' | 'status'>) => void;
  updateApprovalStatus: (id: string, status: 'APPROVED' | 'REJECTED', rejectReason?: string) => void;
}

const FreelancerContext = createContext<FreelancerContextType | undefined>(undefined);

export const FreelancerProvider = ({ children }: { children: ReactNode }) => {
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>(MOCK_FREELANCER_PROFILES);
  const [approvals, setApprovals] = useState<FreelancerApprovalRequest[]>(MOCK_FREELANCER_APPROVALS);

  const updateFreelancer = (id: string, updatedProfile: Partial<FreelancerProfile>) => {
    setFreelancers(prev => prev.map(f => f.id === id ? { ...f, ...updatedProfile } : f));
  };

  const addApprovalRequest = (request: Omit<FreelancerApprovalRequest, 'id' | 'appliedAt' | 'status'>) => {
    const newRequest: FreelancerApprovalRequest = {
      ...request,
      id: `a${Date.now()}`,
      appliedAt: new Date().toISOString().split('T')[0],
      status: 'PENDING'
    };
    setApprovals(prev => [newRequest, ...prev]);
  };

  const updateApprovalStatus = (id: string, status: 'APPROVED' | 'REJECTED', rejectReason?: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status, rejectReason } : a));
  };

  return (
    <FreelancerContext.Provider value={{ freelancers, approvals, updateFreelancer, addApprovalRequest, updateApprovalStatus }}>
      {children}
    </FreelancerContext.Provider>
  );
};

export const useFreelancers = () => {
  const context = useContext(FreelancerContext);
  if (context === undefined) {
    throw new Error('useFreelancers must be used within a FreelancerProvider');
  }
  return context;
};
