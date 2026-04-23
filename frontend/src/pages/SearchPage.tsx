import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ExplorerItemCard from '@/src/components/ExplorerItemCard';
import { cn } from '@/src/lib/utils';
import type { ClassItem, RequestItem } from '@/src/constants';
import { useClasses } from '../context/ClassContext';
import { useEnrollments } from '../context/EnrollmentContext';
import { useRequests } from '../context/RequestContext';
import { useWish } from '../context/WishContext';

type SearchTab = 'all' | 'class' | 'request';

const SEARCH_TABS: Array<{ id: SearchTab; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'class', label: '클래스' },
  { id: 'request', label: '요청' },
];

function matchesClass(item: ClassItem, keyword: string) {
  const normalizedKeyword = keyword.toLowerCase();
  return (
    item.title.toLowerCase().includes(normalizedKeyword) ||
    item.freelancer.toLowerCase().includes(normalizedKeyword)
  );
}

function matchesRequest(item: RequestItem, keyword: string) {
  const normalizedKeyword = keyword.toLowerCase();
  return (
    item.title.toLowerCase().includes(normalizedKeyword) ||
    item.author.toLowerCase().includes(normalizedKeyword) ||
    item.content.toLowerCase().includes(normalizedKeyword)
  );
}

export default function SearchPage() {
  const { classes } = useClasses();
  const { requests, loading: requestsLoading } = useRequests();
  const { wishedIds, toggleWish } = useWish();
  const { enrollments } = useEnrollments();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';
  const [inputValue, setInputValue] = useState(query);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const filteredClasses = useMemo(() => {
    if (!query) {
      return [];
    }

    return classes.filter((item) => matchesClass(item, query));
  }, [classes, query]);

  const filteredRequests = useMemo(() => {
    if (!query) {
      return [];
    }

    return requests.filter((item) => matchesRequest(item, query));
  }, [query, requests]);

  const totalResults = filteredClasses.length + filteredRequests.length;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedKeyword = inputValue.trim();

    if (!trimmedKeyword) {
      setSearchParams({});
      return;
    }

    setSearchParams({ q: trimmedKeyword });
  };

  const renderClassCard = (item: ClassItem) => {
    const currentEnrollment = enrollments.find((enrollment) => enrollment.classId === item.id);

    return (
      <ExplorerItemCard
        key={`class-${item.id}`}
        id={item.id}
        image={item.image}
        title={item.title}
        value={item.price}
        valueLabel="수강료"
        personName={item.freelancer}
        personLabel="프리랜서"
        personId={item.freelancerId}
        category={item.category}
        categoryName={item.category}
        type="class"
        location={item.location}
        rating={item.rating}
        reviews={item.reviews}
        status={item.status}
        enrollmentStatus={currentEnrollment?.status}
        isWished={wishedIds.has(item.id)}
        onWishToggle={() => toggleWish(item.id)}
      />
    );
  };

  const renderRequestCard = (item: RequestItem) => (
    <ExplorerItemCard
      key={`request-${item.id}`}
      id={item.id}
      image={item.image}
      title={item.title}
      value={item.reward}
      valueLabel="보상 금액"
      personName={item.author}
      personLabel="요청자"
      category={item.category}
      categoryName={item.category}
      type="request"
      location={item.location}
      timeSlot={item.timeSlot}
      lessonType={item.lessonType}
      status="요청 중"
    />
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">통합 검색</h1>
        <p className="text-gray-sub">클래스와 클래스 요청을 한 번에 찾아볼 수 있습니다.</p>
      </div>

      <div className="mb-8 rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
        <form className="relative" onSubmit={handleSubmit}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="클래스명, 프리랜서명, 요청 제목을 검색해보세요"
            className="w-full rounded-2xl border-2 border-transparent bg-ivory/50 py-3.5 pl-12 pr-4 outline-none transition-all focus:border-coral"
          />
        </form>

        <div className="mt-5 flex flex-wrap gap-3">
          {SEARCH_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'rounded-2xl border px-5 py-2.5 text-sm font-bold transition-all',
                activeTab === tab.id
                  ? 'border-gray-900 bg-gray-900 text-white shadow-lg shadow-gray-200'
                  : 'border-gray-100 bg-white text-gray-500 hover:border-coral hover:text-coral'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {!query ? (
        <div className="rounded-[32px] border border-dashed border-coral/20 bg-white px-8 py-16 text-center text-gray-400">
          검색어를 입력하면 클래스와 요청 결과를 함께 보여드립니다.
        </div>
      ) : (
        <div className="space-y-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-coral">검색어</p>
              <p className="text-2xl font-bold text-gray-900">{query}</p>
            </div>
            <p className="text-sm text-gray-500">
              총 <span className="font-bold text-gray-900">{totalResults}</span>개의 결과
            </p>
          </div>

          {(activeTab === 'all' || activeTab === 'class') && (
            <section className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">클래스 찾기</h2>
                <span className="text-sm font-semibold text-gray-400">{filteredClasses.length}개</span>
              </div>

              {filteredClasses.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
                  {filteredClasses.map(renderClassCard)}
                </div>
              ) : (
                <div className="rounded-[28px] border border-gray-100 bg-white px-6 py-10 text-center text-gray-400">
                  일치하는 클래스가 없습니다.
                </div>
              )}
            </section>
          )}

          {(activeTab === 'all' || activeTab === 'request') && (
            <section className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">클래스 요청</h2>
                <span className="text-sm font-semibold text-gray-400">{filteredRequests.length}개</span>
              </div>

              {requestsLoading ? (
                <div className="rounded-[28px] border border-gray-100 bg-white px-6 py-10 text-center text-gray-400">
                  요청 목록을 불러오는 중입니다.
                </div>
              ) : filteredRequests.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
                  {filteredRequests.map(renderRequestCard)}
                </div>
              ) : (
                <div className="rounded-[28px] border border-gray-100 bg-white px-6 py-10 text-center text-gray-400">
                  일치하는 클래스 요청이 없습니다.
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
