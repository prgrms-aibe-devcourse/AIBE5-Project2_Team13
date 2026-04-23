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
      name.includes('제빵')
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

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortType, setSortType] = useState('latest');
  const [locationFilter, setLocationFilter] = useState('all');
  const [onlyRecruiting, setOnlyRecruiting] = useState(() => type === 'class');

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

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
      <div className="pt-12 pb-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-sub">{description}</p>
          </div>

          <div className="mb-12 space-y-8">
            <div className="flex flex-col gap-6 rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center gap-6 lg:flex-row">
                <div className="relative w-full lg:flex-1">
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
                      className="w-full rounded-2xl border-2 border-transparent bg-ivory/50 py-3.5 pl-12 pr-6 outline-none transition-all focus:border-coral"
                  />
                </div>

                <div className="flex w-full flex-wrap items-center gap-6 lg:w-auto">
                  {type === 'class' && (
                      <div className="flex rounded-2xl border border-gray-100 bg-ivory/50 p-1.5">
                        {[
                          { id: 'all', label: '전체' },
                          { id: 'online', label: '온라인' },
                          { id: 'offline', label: '오프라인' },
                        ].map((chip) => (
                            <button
                                key={chip.id}
                                onClick={() => handleFilterChange('location', chip.id)}
                                className={cn(
                                    'whitespace-nowrap rounded-xl px-5 py-2 text-sm font-bold transition-all',
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

                  <div className="relative min-w-[140px]">
                    <select
                        value={sortType}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                        className="w-full cursor-pointer appearance-none rounded-2xl border-2 border-transparent bg-ivory/50 py-3.5 pl-5 pr-10 text-sm font-bold text-gray-700 outline-none transition-all focus:border-coral"
                    >
                      <option value="latest">최신순</option>
                      <option value="priceLow">가격 낮은 순</option>
                      <option value="priceHigh">가격 높은 순</option>
                      <option value="rating">평점순</option>
                    </select>
                    <ChevronDown
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                    />
                  </div>
                </div>
              </div>

              {type === 'class' && (
                  <div className="rounded-[24px] border border-coral/10 bg-ivory/50 px-5 py-4">
                    <label className="flex cursor-pointer select-none items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-900">모집중인 클래스만 보기</p>
                        <p className="text-xs text-gray-500">{resultStatusText}</p>
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
            </div>
          </div>

          <div className="mb-12 flex flex-wrap gap-4">
            <button
                onClick={() => handleFilterChange('category', 'all')}
                className={cn(
                    'flex items-center gap-2 rounded-2xl border px-6 py-3 text-base font-bold transition-all',
                    selectedCategory === 'all'
                        ? 'border-coral bg-coral text-white shadow-lg shadow-coral/20'
                        : 'border-gray-100 bg-white text-gray-500 hover:border-coral hover:text-coral'
                )}
            >
              전체
            </button>

            {catLoading ? (
                Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="h-12 w-28 animate-pulse rounded-2xl bg-white" />
                ))
            ) : (
                categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleFilterChange('category', cat.name)}
                        className={cn(
                            'flex items-center gap-2 rounded-2xl border px-6 py-3 text-base font-bold transition-all',
                            selectedCategory === cat.name
                                ? 'border-coral bg-coral text-white shadow-lg shadow-coral/20'
                                : 'border-gray-100 bg-white text-gray-500 hover:border-coral hover:text-coral'
                        )}
                    >
                      {getCategoryIcon(cat.name)}
                      {cat.name}
                    </button>
                ))
            )}
          </div>
        </div>

        <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 rounded-t-[48px] bg-[#F5F5F5] pt-12 pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="overflow-hidden rounded-[32px] bg-white animate-pulse">
                        <div className="aspect-[4/3] bg-gray-100" />
                        <div className="space-y-3 p-6">
                          <div className="h-3 w-1/3 rounded bg-gray-100" />
                          <div className="h-5 w-4/5 rounded bg-gray-100" />
                          <div className="h-4 w-1/4 rounded bg-gray-100" />
                          <div className="mt-4 h-5 w-1/3 rounded bg-gray-100" />
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
                    <p className="text-lg text-gray-sub">검색 결과가 없습니다. 다른 조건으로 찾아보세요.</p>
                  </div>
              )}
            </div>
          </div>
        </section>
      </div>
  );
}