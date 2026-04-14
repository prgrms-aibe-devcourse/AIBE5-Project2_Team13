import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Sparkles, Music, Palette, Drama, Languages, Trophy, Gamepad2, Utensils, MoreHorizontal } from 'lucide-react';
import { CATEGORIES } from '@/src/constants';
import { cn } from '@/src/lib/utils';
import ExplorerItemCard from './ExplorerItemCard';

interface ExplorerGridProps<T> {
  items: T[];
  type: 'class' | 'request';
  title: string;
  description: string;
  renderItem: (item: T) => React.ReactNode;
  filterFn: (item: T, query: string, category: string) => boolean;
  sortFn: (a: T, b: T, sortType: string) => number;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sparkles': return <Sparkles size={18} />;
    case 'Music': return <Music size={18} />;
    case 'Palette': return <Palette size={18} />;
    case 'Drama': return <Drama size={18} />;
    case 'Languages': return <Languages size={18} />;
    case 'Trophy': return <Trophy size={18} />;
    case 'Gamepad2': return <Gamepad2 size={18} />;
    case 'Utensils': return <Utensils size={18} />;
    case 'MoreHorizontal': return <MoreHorizontal size={18} />;
    default: return null;
  }
};

export default function ExplorerGrid<T>({
  items,
  type,
  title,
  description,
  filterFn,
  sortFn
}: ExplorerGridProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortType, setSortType] = useState('latest');
  const [locationFilter, setLocationFilter] = useState('all'); // 'all', 'online', 'offline'

  const filteredAndSortedItems = useMemo(() => {
    return items
      .filter(item => {
        const matchesBase = filterFn(item, searchQuery, selectedCategory);
        if (type === 'class') {
          const classItem = item as any;
          const matchesLocation = locationFilter === 'all' || 
            (locationFilter === 'online' && !classItem.isOffline) ||
            (locationFilter === 'offline' && classItem.isOffline);
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

      {/* Search and Filters */}
      <div className="space-y-8 mb-12">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={type === 'class' ? "클래스명, 프리랜서명을 검색해보세요" : "요청 제목을 검색해보세요"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border-2 border-transparent focus:border-coral rounded-2xl outline-none transition-all shadow-sm"
            />
          </div>
          
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

        {/* Quick Search Tags */}
        <div className="flex flex-wrap gap-2 px-1">
          {['#초보환영', '#원데이클래스', '#자기계발', '#주말취미'].map(tag => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag.replace('#', ''))}
              className="text-sm font-medium text-gray-400 hover:text-coral transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-5 py-2 rounded-lg font-bold transition-all text-[16px] flex items-center gap-2",
              selectedCategory === 'all' 
                ? "bg-gray-900 text-white shadow-md" 
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            전체
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-5 py-2 rounded-lg font-bold transition-all text-[16px] flex items-center gap-2",
                selectedCategory === cat.id 
                  ? "bg-gray-900 text-white shadow-md" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              {getCategoryIcon(cat.icon)}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredAndSortedItems.length > 0 ? (
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
              categoryName={CATEGORIES.find(c => c.id === item.category)?.name || ''}
              type={type}
              location={item.location}
              timeSlot={item.timeSlot}
              rating={item.rating}
              reviews={item.reviews}
              status={type === 'request' ? '요청 중' : undefined}
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
