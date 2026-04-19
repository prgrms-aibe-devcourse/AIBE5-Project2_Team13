import React from 'react';
import { ClassItem } from '@/src/constants';
import ExplorerGrid from '@/src/components/ExplorerGrid';
import { useClasses } from '../context/ClassContext';
import { useWish } from '../context/WishContext';

export default function BrowseClasses() {
  const { classes, fetchClasses } = useClasses();
  const { wishedIds } = useWish();
  
  const filterFn = (item: ClassItem, query: string, category: string, locationFilter: string, onlyRecruiting: boolean) => {
    const matchesCategory = category === 'all' || item.category === category;
    const matchesSearch = item.title.toLowerCase().includes(query.toLowerCase()) || 
                         item.freelancer.toLowerCase().includes(query.toLowerCase());

    //온라인/오프라인 필터
    const matchesLocation =
      locationFilter === 'all' ||
      (locationFilter === 'online'  && !item.isOffline) ||
      (locationFilter === 'offline' &&  item.isOffline);

    const matchesRecruiting = !onlyRecruiting || item.status === 'OPEN';

    return matchesCategory && matchesSearch && matchesLocation && matchesRecruiting;
  };

  //정렬 기능
  const sortStrategies: Record<string, (a: ClassItem, b: ClassItem) => number> = {
    priceLow: (a, b) => a.price - b.price,
    priceHigh: (a, b) => b.price - a.price,
    rating: (a, b) => (b.rating || 0) - (a.rating || 0),
    latest: (a, b) => {
      // 여기서만 날짜 변환 (미리 데이터에 타임스탬프를 심어두면 더 빠름!)
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  };

  const sortFn = (a: ClassItem, b: ClassItem, sortType: string) => {
    const strategy = sortStrategies[sortType];
    return strategy ? strategy(a, b) : 0;
  };

  return (
    <ExplorerGrid<ClassItem>
      items={classes}
      type="class"
      title="클래스 전체보기"
      description="당신의 새로운 시작을 응원하는 다양한 클래스들이 기다리고 있어요."
      filterFn={filterFn}
      sortFn={sortFn}
      wishedIds={wishedIds}
      renderItem={() => null}
      onFilterChange={fetchClasses} // 필터 변경 시 API 재호출 (서버 데이터 최신화)
    />
  );
}
