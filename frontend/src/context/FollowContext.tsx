import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/axios';
import { getAccessToken } from '../lib/auth';
import { useAuth } from './AuthContext';

/**
 * 👤 팔로우 Context
 *
 * WishContext와 동일한 패턴으로 계정 변경을 감지합니다.
 * - 로그아웃             → followingIds 빈 Set 초기화
 * - 다른 계정으로 로그인 → 새 계정의 팔로우 목록 재조회
 *
 * 핵심: useEffect의 의존성을 [user?.email]로 설정해
 *       계정이 바뀔 때마다 fetchFollowingIds()가 자동 호출됩니다.
 */

interface FollowContextType {
  followingIds: Set<string>;
  followLoading: boolean;
  fetchFollowingIds: () => void;
  toggleFollow: (targetMemberId: string) => Promise<void>;
  isFollowing: (targetMemberId: string) => boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export const FollowProvider = ({ children }: { children: ReactNode }) => {

  const { user } = useAuth(); // 로그인 계정 감지용
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followLoading, setFollowLoading] = useState(false);

  // ─────────────────────────────────────
  // 내가 팔로우한 memberId 목록 조회
  // ─────────────────────────────────────
  const fetchFollowingIds = async () => {
    const token = getAccessToken();
    if (!token) {
      setFollowingIds(new Set()); // 비로그인 → 빈 Set 초기화
      return;
    }
    try {
      const response = await apiClient.get<number[]>('/follows');
      setFollowingIds(new Set(response.data.map(String)));
    } catch {
      setFollowingIds(new Set());
    }
  };

  // user?.email이 바뀔 때마다 재조회
  // - 로그아웃 → user = null → email = undefined → 빈 Set
  // - 다른 계정 로그인 → email 변경 → 새 계정 목록 재조회
  useEffect(() => {
    fetchFollowingIds();
  }, [user?.email]);

  // ─────────────────────────────────────
  // 팔로우 토글 — 팔로우/팔로우 취소
  // ─────────────────────────────────────
  const toggleFollow = async (targetMemberId: string) => {
    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    setFollowLoading(true);
    try {
      if (followingIds.has(targetMemberId)) {
        await apiClient.delete(`/follows/${targetMemberId}`);
        setFollowingIds(prev => {
          const next = new Set(prev);
          next.delete(targetMemberId);
          return next;
        });
      } else {
        await apiClient.post(`/follows/${targetMemberId}`);
        setFollowingIds(prev => new Set([...prev, targetMemberId]));
      }
    } catch (err) {
      console.error('[FollowContext] 팔로우 토글 실패:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const isFollowing = (targetMemberId: string): boolean => {
    return followingIds.has(targetMemberId);
  };

  return (
    <FollowContext.Provider value={{
      followingIds,
      followLoading,
      fetchFollowingIds,
      toggleFollow,
      isFollowing,
    }}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = () => {
  const context = useContext(FollowContext);
  if (!context) throw new Error('useFollow must be used within FollowProvider');
  return context;
};
