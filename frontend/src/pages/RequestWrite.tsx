import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useRequests, RequestClassCreateBody } from '../context/RequestContext';
import { useCategories } from '../context/CategoryContext';
import { getAccessToken } from '../lib/auth';

export default function RequestWrite() {
  const navigate   = useNavigate();
  const { createRequest } = useRequests();
  const { categories }    = useCategories(); // DB에서 가져온 실제 카테고리 목록

  // ── 폼 입력 상태 ──────────────────────────────
  const [title,       setTitle]       = useState('');
  const [categoryId,  setCategoryId]  = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [price,       setPrice]       = useState('');
  const [maxCapacity, setMaxCapacity] = useState('1');
  const [isOnline,    setIsOnline]    = useState<boolean>(false);
  const [startAt,     setStartAt]     = useState('');
  const [endAt,       setEndAt]       = useState('');

  // 제출 중 상태 (버튼 중복 클릭 방지)
  const [submitting, setSubmitting] = useState(false);

  // ── 폼 제출 핸들러 ────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 제출 시점에 로그인 여부 확인 (렌더링 시점에 막으면 공유 URL 접근도 차단됨)
    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    // 카테고리 미선택 방어
    if (categoryId === '') {
      alert('카테고리를 선택해주세요.');
      return;
    }

    // 종료일이 시작일보다 이전이면 방어
    if (new Date(endAt) <= new Date(startAt)) {
      alert('종료 일시는 시작 일시보다 이후여야 합니다.');
      return;
    }

    // 백엔드 RequestClassCreateRequest.java 와 필드명 일치시켜 전송
    const body: RequestClassCreateBody = {
      title,
      description,
      categoryId: Number(categoryId),
      price:       Number(price) || 0,
      isOnline,
      startAt: startAt + ':00',
      endAt:   endAt   + ':00',
      maxCapacity: Number(maxCapacity) || 1,
    };

    setSubmitting(true);
    const success = await createRequest(body);
    setSubmitting(false);

    if (success) {
      alert('요청 클래스가 등록되었습니다!');
      navigate('/requests'); // 목록 페이지로 이동
    } else {
      alert('등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-coral mb-8 transition-colors font-medium"
      >
        <ChevronLeft size={20} /> 뒤로가기
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-coral/5"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">클래스 요청하기</h1>
        <p className="text-gray-sub mb-10">찾으시는 클래스가 없다면 프리랜서들에게 직접 요청해보세요.</p>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* 요청 제목 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">요청 제목 *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="어떤 클래스를 찾으시나요? (예: 주말 오전 수채화 클래스)"
              className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
            />
          </div>

          {/* 카테고리 — DB에서 가져온 실제 대분류 목록 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">카테고리 *</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all appearance-none"
            >
              <option value="">카테고리를 선택해주세요</option>
              {/* ✅ 하드코딩 제거 — DB 카테고리 id와 name 사용 */}
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* 온/오프라인 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">수업 방식 *</label>
            <div className="flex gap-4">
              {[
                { label: '오프라인', value: false },
                { label: '온라인',   value: true  },
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  type="button" // submit 방지
                  onClick={() => setIsOnline(opt.value)}
                  className={`flex-1 py-4 rounded-2xl font-bold border-2 transition-all
                    ${isOnline === opt.value
                      ? 'bg-coral text-white border-coral'
                      : 'bg-ivory text-gray-500 border-transparent hover:border-coral/30'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 희망 일시 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">희망 시작 일시 *</label>
              <input
                type="datetime-local"
                required
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">희망 종료 일시 *</label>
              <input
                type="datetime-local"
                required
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
              />
            </div>
          </div>

          {/* 상세 내용 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">상세 내용</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="원하시는 커리큘럼, 시간대 등 상세한 조건을 적어주세요."
              className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all min-h-[160px] resize-none"
            />
          </div>

          {/* 희망 금액 / 인원 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">희망 금액 (1회 기준)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="예: 50000"
                  className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all pr-12"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">원</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">희망 인원</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all pr-12"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">명</span>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-5 bg-coral text-white font-bold rounded-3xl hover:bg-coral/90 transition-all shadow-xl shadow-coral/30 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={22} />
              {submitting ? '등록 중...' : '요청 등록하기'}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
