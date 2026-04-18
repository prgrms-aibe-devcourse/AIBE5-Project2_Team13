import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import apiClient from '../api/axios';
import { getAccessToken } from '../lib/auth';

interface WishContextType {
  wishedIds: Set<string>;
  fetchWishedIds: () => Promise<void>;
  isWished: (classId: string | number) => boolean;
  syncWishStatus: (classId: string | number) => Promise<boolean>;
  toggleWish: (classId: string | number) => Promise<boolean>;
}

const WishContext = createContext<WishContextType | undefined>(undefined);

const toWishId = (classId: string | number) => String(classId);

export function WishProvider({ children }: { children: ReactNode }) {
  const [wishedIds, setWishedIds] = useState<Set<string>>(new Set());

  const fetchWishedIds = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setWishedIds(new Set());
      return;
    }

    try {
      const response = await apiClient.get<number[]>('/wishes');
      setWishedIds(new Set(response.data.map(String)));
    } catch {
      setWishedIds(new Set());
    }
  }, []);

  useEffect(() => {
    fetchWishedIds();
  }, [fetchWishedIds]);

  const isWished = useCallback(
    (classId: string | number) => wishedIds.has(toWishId(classId)),
    [wishedIds],
  );

  const syncWishStatus = useCallback(async (classId: string | number) => {
    const token = getAccessToken();
    const wishId = toWishId(classId);

    if (!token) {
      setWishedIds((prev) => {
        const next = new Set(prev);
        next.delete(wishId);
        return next;
      });
      return false;
    }

    const response = await apiClient.get<{ wished: boolean }>(`/wishes/${wishId}`);
    const wished = response.data.wished;

    setWishedIds((prev) => {
      const next = new Set(prev);
      if (wished) next.add(wishId);
      else next.delete(wishId);
      return next;
    });

    return wished;
  }, []);

  const toggleWish = useCallback(async (classId: string | number) => {
    const wishId = toWishId(classId);
    const wished = wishedIds.has(wishId);

    if (wished) {
      await apiClient.delete(`/wishes/${wishId}`);
    } else {
      await apiClient.post(`/wishes/${wishId}`);
    }

    setWishedIds((prev) => {
      const next = new Set(prev);
      if (wished) next.delete(wishId);
      else next.add(wishId);
      return next;
    });

    return !wished;
  }, [wishedIds]);

  return (
    <WishContext.Provider value={{ wishedIds, fetchWishedIds, isWished, syncWishStatus, toggleWish }}>
      {children}
    </WishContext.Provider>
  );
}

export function useWish() {
  const context = useContext(WishContext);
  if (context === undefined) {
    throw new Error('useWish must be used within a WishProvider');
  }
  return context;
}
