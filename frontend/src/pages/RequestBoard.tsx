import React from 'react';
import { RequestItem } from '@/src/constants';
import ExplorerGrid from '@/src/components/ExplorerGrid';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRequests } from '../context/RequestContext';

export default function RequestBoard() {
  const navigate = useNavigate();
  // loading, error 상태도 함께 구조분해합니다.
  const { requests, loading, error } = useRequests();

  const filterFn = (item: RequestItem, query: string, category: string) => {
    // category는 'all' 또는 DB 카테고리 name (예: "미술·공예")
    // item.category도 toRequestItem()에서 categoryName으로 저장되므로 name끼리 비교됩니다.
    const matchesCategory = category === 'all' || item.category === category;
    const matchesSearch = item.title.toLowerCase().includes(query.toLowerCase()) ||
                         item.author.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesSearch;
  };

  const sortFn = (a: RequestItem, b: RequestItem, sortType: string) => {
    if (sortType === 'priceLow') return a.reward - b.reward;
    if (sortType === 'priceHigh') return b.reward - a.reward;
    return 0;
  };

  // API 호출 중일 때 로딩 메시지 표시
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400 text-lg">
        클래스 목록을 불러오는 중...
      </div>
    );
  }

  // API 호출 실패 시 에러 메시지 표시
  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-400 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="relative">
      <ExplorerGrid<RequestItem>
        items={requests}
        type="request"
        title="클래스 요청 목록"
        description="이런 클래스를 찾고 있어요!"
        filterFn={filterFn}
        sortFn={sortFn}
        renderItem={() => null}
      />
      
      {/* Floating Action Button for Request */}
      <div className="fixed bottom-10 right-10 z-40">
        <button 
          onClick={() => navigate('/requests/write')}
          className="flex items-center gap-2 px-8 py-4 bg-coral text-white font-bold rounded-3xl hover:bg-coral/90 transition-all shadow-2xl shadow-coral/40"
        >
          <Plus size={24} /> 요청 글쓰기
        </button>
      </div>
    </div>
  );
}
