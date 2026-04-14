import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_REPORTS, ReportItem } from '../constants';

interface ReportContextType {
  reports: ReportItem[];
  addReport: (type: ReportItem['type'], reason: string) => void;
  resolveReport: (id: string) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<ReportItem[]>(MOCK_REPORTS);

  const addReport = (type: ReportItem['type'], reason: string) => {
    const newReport: ReportItem = {
      id: `r${Date.now()}`,
      type,
      reason,
      reportedAt: new Date().toISOString().split('T')[0],
      status: 'PENDING',
    };
    setReports(prev => [newReport, ...prev]);
  };

  const resolveReport = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'RESOLVED' } : r));
  };

  return (
    <ReportContext.Provider value={{ reports, addReport, resolveReport }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
};
