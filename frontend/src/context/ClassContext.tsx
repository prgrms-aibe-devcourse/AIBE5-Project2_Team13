import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_CLASSES, ClassItem } from '../constants';

interface ClassContextType {
  classes: ClassItem[];
  addClass: (newClass: Omit<ClassItem, 'id' | 'rating' | 'reviews' | 'createdAt'>) => void;
  deleteClass: (id: string) => void;
  updateClass: (id: string, updatedClass: Partial<ClassItem>) => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider = ({ children }: { children: ReactNode }) => {
  const [classes, setClasses] = useState<ClassItem[]>(MOCK_CLASSES);

  const addClass = (newClass: Omit<ClassItem, 'id' | 'rating' | 'reviews' | 'createdAt'>) => {
    const classToAdd: ClassItem = {
      ...newClass,
      id: Math.random().toString(36).substr(2, 9),
      rating: 0,
      reviews: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClasses(prev => [classToAdd, ...prev]);
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  const updateClass = (id: string, updatedClass: Partial<ClassItem>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updatedClass } : c));
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
