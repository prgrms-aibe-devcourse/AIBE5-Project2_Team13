import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RequestItem, MOCK_REQUESTS } from '../constants';

interface RequestContextType {
  requests: RequestItem[];
  addRequest: (request: Omit<RequestItem, 'id' | 'date' | 'comments'>) => void;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export function RequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<RequestItem[]>(MOCK_REQUESTS);

  const addRequest = (newRequest: Omit<RequestItem, 'id' | 'date' | 'comments'>) => {
    const request: RequestItem = {
      ...newRequest,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      comments: 0,
    };
    setRequests((prev) => [request, ...prev]);
  };

  return (
    <RequestContext.Provider value={{ requests, addRequest }}>
      {children}
    </RequestContext.Provider>
  );
}

export function useRequests() {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
}
