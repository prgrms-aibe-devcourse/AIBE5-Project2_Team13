import React from 'react';
import {
  Star,
  Sparkles,
  Music,
  Palette,
  Drama,
  Languages,
  Trophy,
  Gamepad2,
  Utensils,
  MoreHorizontal,
  Heart,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import SafeImage from './SafeImage';

interface ExplorerItemCardProps {
  id: string;
  image: string;
  title: string;
  value: number;
  valueLabel: string;
  personName: string;
  personLabel: string;
  personId?: string;
  category: string;
  categoryName: string;
  type?: 'class' | 'request';
  location?: string;
  timeSlot?: string;
  lessonType?: string; // 온라인 / 오프라인
  rating?: number;
  reviews?: number;
  status?: string;
  enrollmentStatus?: string;
  isWished?: boolean; // 찜 여부 (하트 표시)
  compact?: boolean;
  imageLoading?: 'eager' | 'lazy';
  onWishToggle?: () => void | Promise<void>;
}

// 카테고리 배경 색
const CATEGORY_BG: Record<string, string> = {
  '뷰티·패션': 'bg-pink-100',
  '음악·악기': 'bg-purple-100',
  '미술·공예': 'bg-orange-100',
  '댄스·연기': 'bg-red-100',
  '어학·교육': 'bg-blue-100',
  '스포츠·레저': 'bg-green-100',
  '게임': 'bg-indigo-100',
  '라이프·요리': 'bg-yellow-100',
  '기타': 'bg-gray-100',
};

// 카테고리 아이콘
const getCategoryIcon = (name: string) => {
  const cls = 'w-16 h-16 opacity-40';

  switch (name) {
    case '뷰티·패션':
      return <Sparkles className={cls} />;
    case '음악·악기':
      return <Music className={cls} />;
    case '미술·공예':
      return <Palette className={cls} />;
    case '댄스·연기':
      return <Drama className={cls} />;
    case '어학·교육':
      return <Languages className={cls} />;
    case '스포츠·레저':
      return <Trophy className={cls} />;
    case '게임':
      return <Gamepad2 className={cls} />;
    case '라이프·요리':
      return <Utensils className={cls} />;
    default:
      return <MoreHorizontal className={cls} />;
  }
};

const lessonTypeBadgeClass = (lessonType?: string) =>
  lessonType === '온라인'
    ? 'bg-blue-50 text-blue-500'
    : lessonType === '오프라인'
      ? 'bg-orange-50 text-orange-500'
      : 'bg-gray-100 text-gray-400';

const ExplorerItemCard: React.FC<ExplorerItemCardProps> = ({
                                                             id,
                                                             image,
                                                             title,
                                                             value,
                                                             personName,
                                                             categoryName,
                                                             type = 'class',
                                                             location,
                                                             lessonType,
                                                             rating,
                                                             reviews,
                                                             status,
                                                             enrollmentStatus,
                                                             isWished = false,
                                                           compact = false,
                                                           imageLoading = 'lazy',
                                                           onWishToggle,
                                                         }) => {
  const isClosed = status !== 'OPEN';
  const classMeta = [lessonType, location].filter(Boolean).join(' · ');

  return (
      <motion.div
          whileHover={{ y: -8 }}
          className={cn(
              'group overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl',
              compact && 'rounded-[24px]'
          )}
      >
        <Link to={type === 'class' ? `/class/${id}` : `/request/${id}`}>

          {/* 이미지 영역 */}
          <div className={cn('relative aspect-[4/3] overflow-hidden', compact && 'aspect-[4/2.8]')}>

            {type === 'request' ? (
                <div
                    className={cn(
                        'w-full h-full flex flex-col items-center justify-center gap-3',
                        CATEGORY_BG[categoryName] ?? 'bg-gray-100'
                    )}
                >
                  {getCategoryIcon(categoryName)}
                  <span className="text-sm font-bold text-gray-500">
                {categoryName}
              </span>
                </div>
            ) : (
                <SafeImage
                    src={image}
                    alt={title}
                    loading={imageLoading}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            )}

            {/* 좋아요 버튼 */}
            <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onWishToggle?.();
                }}
                className="absolute top-3 right-3 z-10 rounded-full bg-white/90 p-2 shadow"
            >
              <Heart
                  size={20}
                  className={cn(
                      isWished ? 'fill-coral text-coral' : 'text-gray-300'
                  )}
              />
            </button>

            {/* 모집마감 오버레이 */}
            {type === 'class' && isClosed && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold">
                  모집마감
                </div>
            )}
          </div>

          {/* 텍스트 영역 */}
          <div className={cn('p-6', compact && 'p-4')}>
            <p className="text-xs text-gray-400 mb-1">{personName}</p>

            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
              {title}
            </h3>

            {/* 요청 카드 */}
            {type === 'request' ? (
                <div className="mb-3">
                  <span
                      className={cn(
                          'inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold',
                          lessonTypeBadgeClass(lessonType)
                      )}
                  >
                    {lessonType ?? '온라인/오프라인 미정'}
                  </span>
                </div>
            ) : (
                <>
                  <div className="mb-3 flex min-h-6 items-center gap-2 text-sm text-gray-500">
                    {lessonType && (
                        <span
                            className={cn(
                                'inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold',
                                lessonTypeBadgeClass(lessonType)
                            )}
                        >
                          {lessonType}
                        </span>
                    )}

                    {lessonType && location && <span className="text-gray-300">·</span>}

                    {location && (
                        <span className="min-w-0 truncate text-sm text-gray-500">
                          {location}
                        </span>
                    )}
                  </div>

                  {!lessonType && !location && classMeta === '' && (
                      <div className="mb-3 min-h-6" />
                  )}

                  <div className="mb-3 flex items-center gap-1">
                    <Star className="fill-yellow-400 text-yellow-400" size={14} />
                    <span className="text-sm font-bold">{rating || 0}</span>
                    <span className="text-xs text-gray-400">
                  ({reviews || 0})
                </span>
                  </div>
                </>
            )}

            <div className="border-t border-[#EAE7E2] pt-3">
              <span className="shrink-0 whitespace-nowrap text-lg font-bold">
                {value.toLocaleString()}원
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
  );
};

export default React.memo(ExplorerItemCard);
