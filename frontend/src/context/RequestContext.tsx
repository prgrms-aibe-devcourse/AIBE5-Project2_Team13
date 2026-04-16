import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RequestItem } from '../constants';
import apiClient from '../api/axios';
import { getAccessToken } from '../lib/auth';

/**
 * 백엔드 GET /api/request-classes 응답 타입
 * RequestClassResponse.java 필드와 1:1 대응
 */
interface RequestClassApiResponse {
  id: number;
  title: string;
  description: string;
  categoryName: string;
  requesterName: string;
  requesterId: number;
  price: number;
  isOnline: boolean;
  startAt: string;
  endAt: string;
  maxCapacity: number;
  status: string;
  createdAt: string;
  requesterEmail?: string; // 본인 글 여부 판단용 (백엔드 응답에 추가 필요)
}

/**
 * 백엔드 POST /api/request-classes 요청 타입
 * RequestClassCreateRequest.java 필드와 1:1 대응
 */
export interface RequestClassCreateBody {
  title: string;
  description: string;
  categoryId: number;     // DB 카테고리 ID (숫자)
  price: number;
  isOnline: boolean;
  startAt: string;        // "2025-04-20T10:00:00" 형식
  endAt: string;
  maxCapacity: number;
}

interface RequestContextType {
  requests: RequestItem[];
  loading: boolean;
  error: string | null;
  fetchRequests: () => void;
  createRequest: (body: RequestClassCreateBody) => Promise<boolean>;
  // 목록 화면에서 찜 여부 표시용 — 찜한 classId Set
  wishedIds: Set<string>;
  fetchWishedIds: () => void;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

/**
 * 백엔드 응답 DTO → 프론트엔드 RequestItem 변환 함수
 */
function toRequestItem(api: RequestClassApiResponse): RequestItem {
  // 날짜 포맷 함수: "2026-04-16T14:32:00" → "2026년 04월 16일"
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}년 ${String(d.getMonth()+1).padStart(2,'0')}월 ${String(d.getDate()).padStart(2,'0')}일`;
  };

  return {
    id: String(api.id),
    title: api.title,
    author: api.requesterName,
    date: api.createdAt?.slice(0, 10) ?? '',
    content: api.description ?? '',
    reward: api.price,
    category: api.categoryName ?? 'etc',
    image: `https://picsum.photos/seed/request${api.id}/400/300`,
    comments: 0,
    lessonType: api.isOnline ? '온라인' : '오프라인',
    startAt: formatDate(api.startAt),
    endAt: formatDate(api.endAt),
    requesterEmail: api.requesterEmail ?? '',
  };
}

export function RequestProvider({ children }: { children: ReactNode }) {
  const [requests,   setRequests]   = useState<RequestItem[]>([]);
  const [loading,    setLoading]    = useState<boolean>(false);
  const [error,      setError]      = useState<string | null>(null);
  const [wishedIds,  setWishedIds]  = useState<Set<string>>(new Set());

  // ─────────────────────────────────────
  // 목록 조회
  // ─────────────────────────────────────
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<RequestClassApiResponse[]>('/request-classes');
      setRequests(response.data.map(toRequestItem));
    } catch (err) {
      console.error('요청 클래스 목록 조회 실패:', err);
      setError('클래스 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────
  // 찜 ID 목록 조회 — 로그인한 경우만 호출
  // ─────────────────────────────────────
  const fetchWishedIds = async () => {
    const token = getAccessToken();
    if (!token) return; // 비로그인이면 skip

    try {
      const response = await apiClient.get<number[]>('/wishes');
      // 숫자 배열 → 문자열 Set (카드의 id는 string이므로 변환)
      setWishedIds(new Set(response.data.map(String)));
    } catch {
      // 에러 시 빈 Set 유지 (찜 표시 안 함)
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchWishedIds(); // 목록과 함께 찜 ID도 로드
  }, []);

  // ─────────────────────────────────────
  // 요청 클래스 생성
  //
  // Authorization 헤더에 JWT 토큰이 있어야 합니다.
  // axios 인터셉터에서 자동으로 토큰을 붙여줍니다. (axios.ts 설정 필요)
  // ─────────────────────────────────────
  const createRequest = async (body: RequestClassCreateBody): Promise<boolean> => {
    try {
      await apiClient.post('/request-classes', body);
      // 생성 성공 후 목록을 다시 불러와서 화면을 최신 상태로 갱신
      await fetchRequests();
      return true;
    } catch (err) {
      console.error('요청 클래스 생성 실패:', err);
      return false;
    }
  };

  return (
    <RequestContext.Provider value={{ requests, loading, error, fetchRequests, createRequest, wishedIds, fetchWishedIds }}>
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
