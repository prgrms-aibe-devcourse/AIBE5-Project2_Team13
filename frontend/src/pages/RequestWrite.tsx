import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, Send } from 'lucide-react';
import { motion } from 'motion/react';
import DatePicker from '@/src/components/DatePicker';
import { useRequests, RequestClassCreateBody } from '../context/RequestContext';
import { useCategories } from '../context/CategoryContext';
import { getAccessToken } from '../lib/auth';

export default function RequestWrite() {
  const navigate = useNavigate();
  const { createRequest } = useRequests();
  const { categories } = useCategories();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('1');
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    if (categoryId === '') {
      alert('카테고리를 선택해 주세요.');
      return;
    }

    if (!startDate || !startTime || !endDate || !endTime) {
      alert('시작/종료 날짜와 시간을 모두 입력해 주세요.');
      return;
    }

    const startAt = `${startDate}T${startTime}:00`;
    const endAt = `${endDate}T${endTime}:00`;

    if (new Date(endAt) <= new Date(startAt)) {
      alert('종료 일시는 시작 일시보다 이후여야 합니다.');
      return;
    }

    const body: RequestClassCreateBody = {
      title,
      description,
      categoryId: Number(categoryId),
      price: Number(price) || 0,
      isOnline,
      startAt,
      endAt,
      maxCapacity: Number(maxCapacity) || 1,
    };

    setSubmitting(true);
    const success = await createRequest(body);
    setSubmitting(false);

    if (success) {
      alert('요청 클래스가 등록되었습니다.');
      navigate('/requests');
    } else {
      alert('등록에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
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
        <h1 className="mb-2 text-3xl font-bold text-gray-900">클래스 요청하기</h1>
        <p className="mb-10 text-gray-sub">
          찾으시는 클래스가 없다면 프리랜서에게 직접 요청해 보세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-gray-700">요청 제목 *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="어떤 클래스를 찾으시나요? (예: 주말 오전 수채화 클래스)"
              className="w-full rounded-2xl border-2 border-transparent bg-ivory px-6 py-4 outline-none transition-all focus:border-coral"
            />
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-gray-700">카테고리 *</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full appearance-none rounded-2xl border-2 border-transparent bg-ivory px-6 py-4 outline-none transition-all focus:border-coral"
            >
              <option value="">카테고리를 선택해 주세요</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-gray-700">수업 방식 *</label>
            <div className="flex gap-4">
              {[
                { label: '오프라인', value: false },
                { label: '온라인', value: true },
              ].map((opt) => (
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 flex items-center gap-1 text-sm font-bold text-gray-700">
                <Calendar size={14} /> 희망 시작 일시 *
              </label>
              <div className="space-y-3">
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="시작일을 선택해 주세요"
                  className="w-full"
                />
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-2xl border-2 border-transparent bg-ivory px-6 py-4 outline-none transition-all focus:border-coral"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 flex items-center gap-1 text-sm font-bold text-gray-700">
                <Calendar size={14} /> 희망 종료 일시 *
              </label>
              <div className="space-y-3">
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="종료일을 선택해 주세요"
                  minDate={startDate}
                  className="w-full"
                />
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-2xl border-2 border-transparent bg-ivory px-6 py-4 outline-none transition-all focus:border-coral"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-gray-700">상세 내용</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="원하시는 커리큘럼, 시간대 등 상세 조건을 적어주세요."
              className="min-h-[160px] w-full resize-none rounded-2xl border-2 border-transparent bg-ivory px-6 py-4 outline-none transition-all focus:border-coral"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-sm font-bold text-gray-700">희망 금액 (1회 기준)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
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
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  className="w-full rounded-2xl border-2 border-transparent bg-ivory px-6 py-4 pr-12 outline-none transition-all focus:border-coral"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">명</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-3xl bg-coral py-5 text-lg font-bold text-white shadow-xl shadow-coral/30 transition-all hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-50"
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
