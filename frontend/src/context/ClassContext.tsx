import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/axios';
import { ClassItem } from '../constants';

interface CreateClassPayload {
  title: string;
  description: string;
  categoryId: number;
  price: number;
  isOnline: boolean;
  startAt: string;
  endAt: string;
  maxCapacity: number;
  curriculum?: string;
  location?: string;
}

interface ClassContextType {
  classes: ClassItem[];
  addClass: (newClass: CreateClassPayload) => Promise<void>;
  deleteClass: (id: string) => void;
  updateClass: (id: string, updatedClass: Partial<ClassItem>) => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

interface ClassApiResponse {
  id: number;
  title: string;
  description?: string;
  categoryName: string;
  freelancerName: string;
  freelancerId: number;
  price: number;
  isOnline: boolean;
  startAt?: string;
  endAt?: string;
  maxCapacity?: number;
  status?: string;
  curriculum?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

function toClassItem(api: ClassApiResponse): ClassItem {
  const isOnline = api.isOnline ?? (api as any).online ?? false;

  return {
    id: String(api.id),
    title: api.title,
    freelancer: api.freelancerName,
    freelancerId: String(api.freelancerId),
    price: api.price,
    category: api.categoryName,
    image: `https://picsum.photos/seed/class${api.id}/400/300`,
    rating: 0,
    reviews: 0,
    isOffline: !isOnline,
    location: !isOnline ? api.location ?? '오프라인 장소' : undefined,
    startAt: api.startAt,
    endAt: api.endAt,
    maxCapacity: api.maxCapacity,
    curriculum: api.curriculum,
    description: api.description,
    createdAt: api.createdAt ?? new Date().toISOString(),
    updatedAt: api.updatedAt,
  };
}

export const ClassProvider = ({ children }: { children: ReactNode }) => {
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const fetchClasses = async () => {
    try {
      const response = await apiClient.get<ClassApiResponse[]>('/classes');
      setClasses(response.data.map(toClassItem));
    } catch (err) {
      console.error('클래스 목록 조회 실패:', err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const addClass = async (newClass: CreateClassPayload) => {
    try {
      await apiClient.post('/classes', newClass);
      await fetchClasses();
    } catch (error) {
      console.error('클래스 생성 실패:', error);
      throw error;
    }
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  const updateClass = async (id: string, updatedClass: Partial<ClassItem>) => {
    try {
      await apiClient.put(`/classes/${id}`, updatedClass);
      setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updatedClass } : c));
    } catch (error) {
      console.error('클래스 수정 실패:', error);
      throw error;
    }
  };

  return (
    <ClassContext.Provider value={{ classes, addClass, deleteClass, updateClass }}>
      {children}
    </ClassContext.Provider>
  );
};

export const useClasses = () => {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error('useClasses must be used within a ClassProvider');
  }
  return context;
};
