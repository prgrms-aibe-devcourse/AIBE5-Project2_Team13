import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/axios';

/**
 * 백엔드 GET /api/categories 응답 타입
 * CategoryResponse.java 필드와 1:1 대응
 */
export interface CategoryItem {
  id: number;       // DB의 카테고리 ID → 필터 키로 사용
  name: string;     // 화면에 표시할 이름 (예: "미술·공예")
  sortOrder: number;
}

interface CategoryContextType {
  categories: CategoryItem[];
  loading: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading]       = useState<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get<CategoryItem[]>('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('카테고리 목록 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []); // 앱 시작 시 한 번만 호출

  return (
    <CategoryContext.Provider value={{ categories, loading }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}
