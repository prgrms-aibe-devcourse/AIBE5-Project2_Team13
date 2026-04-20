import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_FREELANCER_PROFILES, FreelancerProfile } from '../constants';

interface FreelancerContextType {
  freelancers: FreelancerProfile[];
}

const FreelancerContext = createContext<FreelancerContextType | undefined>(undefined);

export const FreelancerProvider = ({ children }: { children: ReactNode }) => {
  const [freelancers] = useState<FreelancerProfile[]>(MOCK_FREELANCER_PROFILES);

  return (
    <FreelancerContext.Provider value={{ freelancers }}>
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
