import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  ChevronDown,
  Sparkles,
  Music,
  Palette,
  Drama,
  Languages,
  Trophy,
  Gamepad2,
  Utensils,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import ExplorerItemCard from './ExplorerItemCard';
import { useCategories } from '../context/CategoryContext';
import { useWish } from '../context/WishContext';
import { useEnrollments } from '../context/EnrollmentContext';

/**
 * 카테고리 이름별 아이콘 매핑 함수
 *
 * DB의 카테고리 이름(name)을 기준으로 아이콘을 결정합니다.
 * exact match 대신 키워드 포함 방식으로 처리해
 * 카테고리명이 조금 달라도 최대한 유연하게 대응합니다.
 */
const getCategoryIcon = (categoryName: string) => {
  const name = (categoryName || '').replace(/\s+/g, '');

  if (name.includes('뷰티') || name.includes('패션')) return <Sparkles size={18} />;
  if (name.includes('음악') || name.includes('악기')) return <Music size={18} />;
  if (name.includes('미술') || name.includes('공예')) return <Palette size={18} />;
  if (name.includes('연기') || name.includes('무용')) return <Drama size={18} />;
  if (name.includes('어학') || name.includes('교육')) return <Languages size={18} />;
  if (name.includes('스포츠') || name.includes('레저')) return <Trophy size={18} />;
  if (name.includes('게임')) return <Gamepad2 size={18} />;
  if (
    name.includes('요리') ||
    name.includes('베이킹') ||
    name.includes('제과') ||
    name.includes('음식')
  ) {
    return <Utensils size={18} />;
  }

  return <MoreHorizontal size={18} />;
};

interface ExplorerGridProps<T> {
  items: T[];
  type: 'class' | 'request';
  title: string;
  description: string;
  renderItem: (item: T) => React.ReactNode;
  filterFn: (
    item: T,
    query: string,
    category: string,
    locationFilter: string,
    onlyRecruiting: boolean
  ) => boolean;
  sortFn: (a: T, b: T, sortType: string) => number;
  wishedIds?: Set<string>;
  loading?: boolean;
  onFilterChange?: () => void;
  initialSearchQuery?: string;
}

/**
 * 클래스/요청 탐색 목록 렌더링 컴포넌트
 *
 * 검색, 카테고리, 지역, 정렬, 모집중 필터를 제공합니다.
 */
export default function ExplorerGrid<T>({
  items,
  type,
  title,
  description,
  filterFn,
  sortFn,
  wishedIds = new Set(),
  loading = false,
  onFilterChange,
  initialSearchQuery = '',
}: ExplorerGridProps<T>) {
  const { categories, loading: catLoading } = useCategories();
  const { toggleWish } = useWish();
  const { enrollments } = useEnrollments();

  // selectedCategory: 'all' 또는 DB 카테고리 name 값 (예: "미술·공예")
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortType, setSortType] = useState('latest');
  const [locationFilter, setLocationFilter] = useState('all');
  const [onlyRecruiting, setOnlyRecruiting] = useState(() => type === 'class');

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  // 필터 변경 콜백
  const handleFilterChange = (filterType: string, value: string | boolean) => {
    if (filterType === 'search') setSearchQuery(String(value));
    if (filterType === 'category') setSelectedCategory(String(value));
    if (filterType === 'sort') setSortType(String(value));
    if (filterType === 'location') setLocationFilter(String(value));
    if (filterType === 'recruiting') setOnlyRecruiting(Boolean(value));

    onFilterChange?.();
  };

  const filteredAndSortedItems = useMemo(() => {
    return items
      .filter((item) => filterFn(item, searchQuery, selectedCategory, locationFilter, onlyRecruiting))
      .sort((a, b) => sortFn(a, b, sortType));
  }, [items, searchQuery, selectedCategory, sortType, locationFilter, onlyRecruiting, filterFn, sortFn]);

  const resultStatusText = useMemo(() => {
    if (type !== 'class') {
      return `전체 ${filteredAndSortedItems.length}개를 보고 있어요`;
    }

    return onlyRecruiting
      ? `현재 모집 중인 클래스 ${filteredAndSortedItems.length}개를 보고 있어요`
      : `전체 클래스 ${filteredAndSortedItems.length}개를 보고 있어요`;
  }, [filteredAndSortedItems.length, onlyRecruiting, type]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-sub">{description}</p>
      </div>

      {/* 검색 & 필터 영역 */}
      <div className="space-y-8 mb-12">
        <div className="flex flex-col gap-6 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          {type === 'class' && (
            <div className="flex flex-col gap-3 rounded-[24px] bg-ivory/50 px-5 py-4 border border-coral/10">
              <span className="text-sm font-semibold text-gray-500">{resultStatusText}</span>

              <label className="flex items-center justify-between gap-4 cursor-pointer select-none">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-900">모집중인 클래스만 보기</p>
                  <p className="text-xs text-gray-500">
                    {onlyRecruiting
                      ? '지금 신청 가능한 클래스만 보여드려요'
                      : '모든 클래스를 함께 보여드려요'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'text-xs font-bold transition-colors',
                      onlyRecruiting ? 'text-coral' : 'text-gray-400'
                    )}
                  >
                    {onlyRecruiting ? 'ON' : 'OFF'}
                  </span>

                  <input
                    type="checkbox"
                    checked={onlyRecruiting}
                    onChange={(e) => handleFilterChange('recruiting', e.target.checked)}
                    className="sr-only"
                  />

                  <span
                    className={cn(
                      'relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300',
                      onlyRecruiting ? 'bg-coral shadow-lg shadow-coral/20' : 'bg-gray-300'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300',
                        onlyRecruiting ? 'translate-x-7' : 'translate-x-1'
                      )}
                    />
                  </span>
                </div>
              </label>
            </div>
          )}

          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* 검색 입력창 */}
            <div className="w-full lg:flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={
                  type === 'class'
                    ? '클래스명, 프리랜서명을 검색해보세요'
                    : '요청 제목을 검색해보세요'
                }
                value={searchQuery}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-ivory/50 border-2 border-transparent focus:border-coral rounded-2xl outline-none transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
              {/* 온라인/오프라인 필터 (클래스일 때만 사용) */}
              {type === 'class' && (
                <div className="flex bg-ivory/50 p-1.5 rounded-2xl border border-gray-100">
                  {[
                    { id: 'all', label: '전체' },
                    { id: 'online', label: '온라인' },
                    { id: 'offline', label: '오프라인' },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => handleFilterChange('location', chip.id)}
                      className={cn(
                        'px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap',
                        locationFilter === chip.id
                          ? 'bg-white text-coral shadow-sm'
                          : 'text-gray-500 hover:text-coral'
                      )}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}

              {/* 정렬 필터 */}
              <div className="relative min-w-[140px]">
                <select
                  value={sortType}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full appearance-none pl-5 pr-10 py-3.5 bg-ivory/50 border-2 border-transparent focus:border-coral rounded-2xl outline-none transition-all font-bold text-gray-700 text-sm cursor-pointer"
                >
                  <option value="latest">최신순</option>
                  <option value="priceLow">가격 낮은 순</option>
                  <option value="priceHigh">가격 높은 순</option>
                  <option value="rating">평점순</option>
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={18}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 카테고리 칩 - DB에서 가져온 실제 카테고리로만 렌더링 */}
        <div className="flex flex-wrap gap-3">
          {/* 전체 버튼 */}
          <button
            onClick={() => handleFilterChange('category', 'all')}
            className={cn(
              'px-5 py-2.5 rounded-2xl font-bold transition-all text-sm flex items-center gap-2 border',
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200'
                : 'bg-white text-gray-500 border-gray-100 hover:border-coral hover:text-coral'
            )}
          >
            전체
          </button>

          {/* 카테고리 API 로딩 중엔 스켈레톤 표시 */}
          {catLoading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="px-5 py-2.5 rounded-2xl bg-gray-100 animate-pulse w-24 h-10"
              />
            ))
          ) : (
            categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleFilterChange('category', cat.name)}
                className={cn(
                  'px-5 py-2.5 rounded-2xl font-bold transition-all text-sm flex items-center gap-2 border',
                  selectedCategory === cat.name
                    ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200'
                    : 'bg-white text-gray-500 border-gray-100 hover:border-coral hover:text-coral'
                )}
              >
                {getCategoryIcon(cat.name)}
                {cat.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[32px] overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-gray-100" />
              <div className="p-6 space-y-3">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-5 bg-gray-100 rounded w-4/5" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
                <div className="h-5 bg-gray-100 rounded w-1/3 mt-4" />
              </div>
            </div>
          ))
        ) : filteredAndSortedItems.length > 0 ? (
          filteredAndSortedItems.map((item: any) => {
            const currentEnrollment = enrollments.find((e) => e.classId === item.id);

            return (
              <ExplorerItemCard
                key={item.id}
                id={item.id}
                image={item.image}
                title={item.title}
                value={type === 'class' ? item.price : item.reward}
                valueLabel={type === 'class' ? '수강료' : '보상 금액'}
                personName={type === 'class' ? item.freelancer : item.author}
                personLabel={type === 'class' ? '프리랜서' : '요청자'}
                personId={type === 'class' ? item.freelancerId : undefined}
                category={item.category}
                categoryName={item.category}
                type={type}
                location={item.location}
                timeSlot={item.timeSlot}
                lessonType={item.lessonType}
                rating={item.rating}
                reviews={item.reviews}
                status={type === 'request' ? '요청 중' : item.status}
                enrollmentStatus={currentEnrollment?.status}
                isWished={wishedIds.has(item.id)}
                onWishToggle={wishedIds.has(item.id) ? () => toggleWish(item.id) : undefined}
              />
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-gray-sub text-lg">검색 결과가 없습니다. 다른 조건으로 찾아보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
