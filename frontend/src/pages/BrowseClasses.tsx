import React from 'react';
import { ClassItem } from '@/src/constants';
import ExplorerGrid from '@/src/components/ExplorerGrid';
import { useClasses } from '../context/ClassContext';
import { useWish } from '../context/WishContext';

export default function BrowseClasses() {
  const { classes } = useClasses();
  const { wishedIds } = useWish();
  
  const filterFn = (item: ClassItem, query: string, category: string) => {
    const matchesCategory = category === 'all' || item.category === category;
    const matchesSearch = item.title.toLowerCase().includes(query.toLowerCase()) || 
                         item.freelancer.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesSearch;
  };

  const sortFn = (a: ClassItem, b: ClassItem, sortType: string) => {
    if (sortType === 'priceLow') return a.price - b.price;
    if (sortType === 'priceHigh') return b.price - a.price;
    if (sortType === 'rating') return b.rating - a.rating;
    if (sortType === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0;
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
      renderItem={() => null} // Not used as ExplorerGrid handles rendering via ExplorerItemCard
    />
  );
}
