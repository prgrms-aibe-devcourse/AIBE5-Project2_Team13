import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { useRequests, RequestClassUpdateBody } from '../context/RequestContext';

export default function RequestEdit() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { requests, updateRequest } = useRequests();

  // ── 수정 대상 클래스 찾기 ─────────────────────────
  const item = requests.find(r => r.id === id);

  // 로그인 체크
  const token = localStorage.getItem('accessToken');
  if (!token) {
    alert('로그인이 필요한 서비스입니다.');
    navigate('/login');
    return null;
  }

  // ── 폼 상태 — 제목·카테고리 제외 ──────────────────
  const [description, setDescription] = useState('');
  const [price,       setPrice]       = useState('');
  const [maxCapacity, setMaxCapacity] = useState('1');
  const [isOnline,    setIsOnline]    = useState<boolean>(false);
  const [startAt,     setStartAt]     = useState('');
  const [endAt,       setEndAt]       = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  // item이 로드되면 기존 값으로 폼 초기화
  useEffect(() => {
    if (!item) return;

    setDescription(item.content ?? '');
    setPrice(String(item.reward ?? 0));
    setMaxCapacity(String(1));
    setIsOnline(item.lessonType === '온라인');

    // 날짜 역변환: "2026년 04월 16일" → "2026-04-16T00:00" (input[datetime-local] 형식)
    const parseDate = (dateStr: string): string => {
      if (!dateStr) return '';
      const match = dateStr.match(/(\d{4})년\s(\d{2})월\s(\d{2})일/);
      if (match) return `${match[1]}-${match[2]}-${match[3]}T00:00`;
      return '';
    };

    setStartAt(parseDate(item.startAt ?? ''));
    setEndAt(parseDate(item.endAt ?? ''));
  }, [item]);

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">요청 클래스를 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/requests')} className="text-coral font-bold">
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  // ── 저장 핸들러 ───────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(endAt) <= new Date(startAt)) {
      alert('종료 일시는 시작 일시보다 이후여야 합니다.');
      return;
    }

    const body: RequestClassUpdateBody = {
      description,
      price:       Number(price) || 0,
      isOnline,
      startAt:     startAt + ':00',
      endAt:       endAt   + ':00',
      maxCapacity: Number(maxCapacity) || 1,
    };

    setSubmitting(true);
    const success = await updateRequest(id!, body);
    setSubmitting(false);

    if (success) {
      alert('수정이 완료되었습니다!');
      navigate('/requests');
    } else {
      alert('수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* 뒤로가기 */}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">요청 클래스 수정</h1>
        <p className="text-gray-sub mb-10">제목과 카테고리는 수정할 수 없습니다.</p>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* 제목 — 수정 불가 (읽기 전용) */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">
              요청 제목
              <span className="ml-2 text-xs text-gray-400 font-normal">(수정 불가)</span>
            </label>
            <input
              type="text"
              value={item.title}
              disabled
              className="w-full px-6 py-4 bg-gray-100 rounded-2xl border-2 border-transparent outline-none text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* 카테고리 — 수정 불가 (읽기 전용) */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">
              카테고리
              <span className="ml-2 text-xs text-gray-400 font-normal">(수정 불가)</span>
            </label>
            <input
              type="text"
              value={item.category}
              disabled
              className="w-full px-6 py-4 bg-gray-100 rounded-2xl border-2 border-transparent outline-none text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* 수업 방식 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">수업 방식 *</label>
            <div className="flex gap-4">
              {[
                { label: '오프라인', value: false },
                { label: '온라인',   value: true  },
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  type="button"
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
                onChange={e => setStartAt(e.target.value)}
                className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">희망 종료 일시 *</label>
              <input
                type="datetime-local"
                required
                value={endAt}
                onChange={e => setEndAt(e.target.value)}
                className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
              />
            </div>
          </div>

          {/* 상세 내용 */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">상세 내용</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
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
                  onChange={e => setPrice(e.target.value)}
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
                  onChange={e => setMaxCapacity(e.target.value)}
                  className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all pr-12"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">명</span>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-5 bg-coral text-white font-bold rounded-3xl hover:bg-coral/90 transition-all shadow-xl shadow-coral/30 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={22} />
              {submitting ? '저장 중...' : '저장하기'}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
