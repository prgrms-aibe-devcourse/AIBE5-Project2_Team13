import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Sparkles, Music, Palette, Drama, Languages, Trophy, Gamepad2, Utensils, MoreHorizontal } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import ExplorerItemCard from './ExplorerItemCard';
import { useCategories } from '../context/CategoryContext';

/**
 * 카테고리 이름 → 아이콘 매핑 함수
 *
 * DB의 카테고리 이름(name)을 기준으로 아이콘을 결정합니다.
 * 하드코딩된 id('art', 'music' 등) 대신 실제 DB 이름으로 매칭하므로
 * DB 데이터가 바뀌어도 이 함수만 수정하면 됩니다.
 */
const getCategoryIcon = (categoryName: string) => {
  switch (categoryName) {
    case '뷰티·패션':   return <Sparkles size={18} />;
    case '음악·악기':   return <Music size={18} />;
    case '미술·공예':   return <Palette size={18} />;
    case '댄스·연기':   return <Drama size={18} />;
    case '어학·교육':   return <Languages size={18} />;
    case '스포츠·레저': return <Trophy size={18} />;
    case '게임':        return <Gamepad2 size={18} />;
    case '라이프·요리': return <Utensils size={18} />;
    case '기타':        return <MoreHorizontal size={18} />;
    default:            return null;
  }
};

interface ExplorerGridProps<T> {
  items: T[];
  type: 'class' | 'request';
  title: string;
  description: string;
  renderItem: (item: T) => React.ReactNode;
  filterFn: (item: T, query: string, category: string) => boolean;
  sortFn: (a: T, b: T, sortType: string) => number;
  wishedIds?: Set<string>;
  loading?: boolean; // 카드 영역 로딩 표시용 — 카테고리 탭은 항상 노출
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
}: ExplorerGridProps<T>) {

  // ✅ DB에서 가져온 실제 카테고리 목록 사용
  const { categories, loading: catLoading } = useCategories();

  // selectedCategory: 'all' 또는 DB의 카테고리 name 값 (예: "미술·공예")
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortType, setSortType]             = useState('latest');
  const [locationFilter, setLocationFilter] = useState('all');

  const filteredAndSortedItems = useMemo(() => {
    return items
      .filter(item => {
        // filterFn에 selectedCategory(카테고리 name or 'all')를 넘깁니다.
        const matchesBase = filterFn(item, searchQuery, selectedCategory);
        if (type === 'class') {
          const classItem = item as any;
          const matchesLocation =
            locationFilter === 'all' ||
            (locationFilter === 'online'  && !classItem.isOffline) ||
            (locationFilter === 'offline' &&  classItem.isOffline);
          return matchesBase && matchesLocation;
        }
        return matchesBase;
      })
      .sort((a, b) => sortFn(a, b, sortType));
  }, [items, searchQuery, selectedCategory, sortType, locationFilter, filterFn, sortFn, type]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-sub">{description}</p>
      </div>

      {/* 검색 & 필터 영역 */}
      <div className="space-y-8 mb-12">
        <div className="flex flex-col md:flex-row gap-4">

          {/* 검색 입력창 */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={type === 'class' ? '클래스명, 프리랜서명을 검색해보세요' : '요청 제목을 검색해보세요'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border-2 border-transparent focus:border-coral rounded-2xl outline-none transition-all shadow-sm"
            />
          </div>

          {/* 온/오프라인 필터 — 일반 클래스 전용 */}
          {type === 'class' && (
            <div className="relative min-w-[140px]">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full appearance-none px-6 py-4 bg-white border-2 border-transparent focus:border-coral rounded-2xl outline-none transition-all shadow-sm font-bold text-gray-900 pr-12"
              >
                <option value="all">온/오프라인</option>
                <option value="online">온라인</option>
                <option value="offline">오프라인</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          )}

          {/* 정렬 필터 */}
          <div className="relative min-w-[160px]">
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="w-full appearance-none px-6 py-4 bg-white border-2 border-transparent focus:border-coral rounded-2xl outline-none transition-all shadow-sm font-bold text-gray-900 pr-12"
            >
              <option value="latest">최신순</option>
              <option value="priceLow">가격 낮은 순</option>
              <option value="priceHigh">가격 높은 순</option>
              <option value="rating">평점순</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>
        </div>

        {/* ✅ 카테고리 탭 — DB에서 가져온 실제 카테고리로 렌더링 */}
        <div className="flex flex-wrap gap-3">

          {/* 전체 버튼 */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-5 py-2 rounded-lg font-bold transition-all text-[16px] flex items-center gap-2',
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            전체
          </button>

          {/* 카테고리 API 로딩 중엔 스켈레톤 표시 */}
          {catLoading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="px-5 py-2 rounded-lg bg-gray-100 animate-pulse w-24 h-10"
              />
            ))
          ) : (
            // ✅ DB 카테고리 name을 selectedCategory 키로 사용
            categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={cn(
                  'px-5 py-2 rounded-lg font-bold transition-all text-[16px] flex items-center gap-2',
                  selectedCategory === cat.name
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
          // 카테고리 탭은 이미 보이는 상태, 카드만 스켈레톤으로 표시
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
          filteredAndSortedItems.map((item: any) => (
            <ExplorerItemCard
              key={item.id}
              id={item.id}
              image={item.image}
              title={item.title}
              value={type === 'class' ? item.price : item.reward}
              valueLabel={type === 'class' ? '수강료' : '희망 금액'}
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
              status={type === 'request' ? '요청 중' : undefined}
              isWished={wishedIds.has(item.id)}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-gray-sub text-lg">검색 결과가 없습니다. 다른 조건으로 찾아보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
