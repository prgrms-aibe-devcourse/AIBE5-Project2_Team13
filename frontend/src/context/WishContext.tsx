import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import apiClient from '../api/axios';
import { getAccessToken } from '../lib/auth';
import { useAuth } from './AuthContext';

/**
 * 찜(Wish) Context
 *
 * ✅ 핵심 수정: user(로그인 계정)가 바뀔 때마다 wishedIds 자동 초기화·재조회
 *
 * - 로그아웃              → wishedIds 빈 Set 초기화
 * - 다른 계정으로 로그인  → 새 계정의 찜 목록 재조회
 */

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
  const { user } = useAuth(); // ✅ 로그인 계정 감지용
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

  // ✅ 핵심 수정 — user.email 기준으로 계정 변경 감지
  //
  // user === null      → 로그아웃 → 빈 Set으로 초기화
  // user 이메일 변경   → 다른 계정 로그인 → 새 계정의 찜 목록 재조회
  useEffect(() => {
    fetchWishedIds();
  }, [user?.email]); // email 기준으로 계정 변경 감지 (fetchWishedIds 의존성 제거)

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
    const token = getAccessToken();
    const wishId = toWishId(classId);
    const wished = wishedIds.has(wishId);

    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      return false;
    }

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
