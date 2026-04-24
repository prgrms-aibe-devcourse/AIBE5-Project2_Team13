import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, ChevronLeft, Save } from 'lucide-react';
import { motion } from 'motion/react';
import DatePicker from '@/src/components/DatePicker';
import { useRequests, RequestClassUpdateBody } from '../context/RequestContext';
import { getAccessToken } from '../lib/auth';

export default function RequestEdit() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, updateRequest } = useRequests();

  const item = requests.find(r => r.id === id);

  // 로그인 체크
  const token = getAccessToken();
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
  const [startDate,   setStartDate]   = useState('');  // "YYYY-MM-DD"
  const [endDate,     setEndDate]     = useState('');  // "YYYY-MM-DD"
  const [submitting,  setSubmitting]  = useState(false);

  // item이 로드되면 기존 값으로 폼 초기화
  useEffect(() => {
    if (!item) return;

    setDescription(item.content ?? '');
    setPrice(String(item.reward ?? 0));
    setMaxCapacity(String(1));
    setIsOnline(item.lessonType === '온라인');

    // 날짜 역변환: "2026년 04월 16일" → "2026-04-16" (DatePicker 형식)
    const parseDate = (dateStr: string): string => {
      if (!dateStr) return '';
      const match = dateStr.match(/(\d{4})년\s(\d{2})월\s(\d{2})일/);
      if (match) return `${match[1]}-${match[2]}-${match[3]}`;
      // ISO 형식으로 넘어오는 경우 날짜 부분만 추출
      if (dateStr.includes('T')) return dateStr.split('T')[0];
      return dateStr.slice(0, 10);
    };

    setStartDate(parseDate(item.startAt ?? ''));
    setEndDate(parseDate(item.endAt ?? ''));
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

    if (!startDate || !endDate) {
      alert('시작/종료 날짜를 모두 입력해 주세요.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert('종료 날짜는 시작 날짜보다 이후여야 합니다.');
      return;
    }

    const body: RequestClassUpdateBody = {
      description,
      price:       Number(price) || 0,
      isOnline,
      startAt:     `${startDate}T00:00:00`,  // 날짜만 저장 — 시간은 00:00:00 고정
      endAt:       `${endDate}T00:00:00`,
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
        className="mb-8 flex items-center gap-2 font-medium text-gray-500 transition-colors hover:text-coral"
      >
        <ChevronLeft size={20} /> 뒤로가기
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[40px] border border-coral/5 bg-white p-8 shadow-sm md:p-12"
      >
        <h1 className="mb-2 text-3xl font-bold text-gray-900">요청 클래스 수정</h1>
        <p className="mb-10 text-gray-sub">제목과 카테고리는 수정할 수 없습니다.</p>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* 제목 — 수정 불가 */}
          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-gray-700">
              요청 제목
              <span className="ml-2 text-xs font-normal text-gray-400">(수정 불가)</span>
            </label>
            <input
              type="text"
              value={item.title}
              disabled
              className="w-full cursor-not-allowed rounded-2xl border-2 border-transparent bg-gray-100 px-6 py-4 text-gray-400 outline-none"
            />
          </div>

          {/* 카테고리 — 수정 불가 */}
          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-gray-700">
              카테고리
              <span className="ml-2 text-xs font-normal text-gray-400">(수정 불가)</span>
            </label>
            <input
              type="text"
              value={item.category}
              disabled
              className="w-full cursor-not-allowed rounded-2xl border-2 border-transparent bg-gray-100 px-6 py-4 text-gray-400 outline-none"
            />
          </div>

          {/* 수업 방식 */}
          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-gray-700">수업 방식 *</label>
            <div className="flex gap-4">
              {[
                { label: '오프라인', value: false },
                { label: '온라인',   value: true  },
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => setIsOnline(opt.value)}
                  className={`flex-1 rounded-2xl border-2 py-4 font-bold transition-all ${
                    isOnline === opt.value
                      ? 'border-coral bg-coral text-white'
                      : 'border-transparent bg-ivory text-gray-500 hover:border-coral/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 희망 일시 — RequestWrite와 동일한 DatePicker 사용 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 flex items-center gap-1 text-sm font-bold text-gray-700">
                <Calendar size={14} /> 희망 시작 일시 *
              </label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="시작일을 선택해 주세요"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 flex items-center gap-1 text-sm font-bold text-gray-700">
                <Calendar size={14} /> 희망 종료 일시 *
              </label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="종료일을 선택해 주세요"
                minDate={startDate}
                className="w-full"
              />
            </div>
          </div>

          {/* 상세 내용 */}
          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-gray-700">상세 내용</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="원하시는 커리큘럼, 시간대 등 상세 조건을 적어주세요."
              className="min-h-[160px] w-full resize-none rounded-2xl border-2 border-transparent bg-ivory px-6 py-4 outline-none transition-all focus:border-coral"
            />
          </div>

          {/* 희망 금액 / 인원 */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-sm font-bold text-gray-700">희망 금액 (1회 기준)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="예: 50000"
                  className="w-full rounded-2xl border-2 border-transparent bg-ivory px-6 py-4 pr-12 outline-none transition-all focus:border-coral"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">원</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-sm font-bold text-gray-700">희망 인원</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={maxCapacity}
                  onChange={e => setMaxCapacity(e.target.value)}
                  className="w-full rounded-2xl border-2 border-transparent bg-ivory px-6 py-4 pr-12 outline-none transition-all focus:border-coral"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">명</span>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-3xl bg-coral py-5 text-lg font-bold text-white shadow-xl shadow-coral/30 transition-all hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-50"
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
