import React, { useCallback, useEffect, useMemo } from 'react';
import { ClassItem } from '@/src/constants';
import ExplorerGrid from '@/src/components/ExplorerGrid';
import { useClasses } from '../context/ClassContext';
import { useWish } from '../context/WishContext';
import { useSearchParams } from 'react-router-dom';

export default function BrowseClasses() {
  const { classes, fetchClasses } = useClasses();
  const { wishedIds } = useWish();
  const [searchParams] = useSearchParams();
  const initialSearchQuery = searchParams.get('q')?.trim() ?? '';
  const initialCategory = searchParams.get('category')?.trim() ?? 'all';

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

// 검색어, 카테고리, 위치, 모집 여부 등 다양한 필터링 조건들을 종합하여 클래스 항목이 해당 조건들에 부합하는지 판단합니다.
    const filterFn = useCallback(
    (item: ClassItem, query: string, category: string, locationFilter: string, onlyRecruiting: boolean) => {
      const normalizedQuery = query.toLowerCase();
      const matchesCategory = category === 'all' || item.category === category;
      const matchesSearch =
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.freelancer.toLowerCase().includes(normalizedQuery);
      const matchesLocation =
        locationFilter === 'all' ||
        (locationFilter === 'online' && !item.isOffline) ||
        (locationFilter === 'offline' && item.isOffline);
      const matchesRecruiting = !onlyRecruiting || item.status === 'OPEN';

      return matchesCategory && matchesSearch && matchesLocation && matchesRecruiting;
    },
    []
  );

    // 가격, 평점, 최신순 등 다양한 기준에 따라 클래스 항목을 정렬하기 위한 비교 함수들을 담은 전략 객체를 생성합니다.
    const sortStrategies = useMemo<Record<string, (a: ClassItem, b: ClassItem) => number>>(
        () => ({
      priceLow: (a, b) => a.price - b.price,
      priceHigh: (a, b) => b.price - a.price,
      rating: (a, b) => (b.rating || 0) - (a.rating || 0),
      latest: (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    }),
    []
  );

    // sortType에 따라 동적으로 정렬 전략을 선택하여 두 항목(a, b)을 비교하는 메모이제이션된 정렬 함수입니다.
    const sortFn = useCallback(
    (a: ClassItem, b: ClassItem, sortType: string) => {
      const strategy = sortStrategies[sortType];
      return strategy ? strategy(a, b) : 0;
    },
    [sortStrategies]
  );

  return (
    <ExplorerGrid<ClassItem>
      items={classes}
      type="class"
      title="클래스 전체보기"
      description="당신의 새로운 시작을 응원하는 다양한 클래스들이 기다리고 있어요"
      filterFn={filterFn}
      sortFn={sortFn}
      wishedIds={wishedIds}
      initialSearchQuery={initialSearchQuery}
      initialCategory={initialCategory}
      renderItem={() => null}
    />
  );
}
