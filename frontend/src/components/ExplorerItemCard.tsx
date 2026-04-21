import React from 'react';
import { Star, Sparkles, Music, Palette, Drama, Languages, Trophy, Gamepad2, Utensils, MoreHorizontal, Heart } from 'lucide-react';
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
  isWished?: boolean; // 찜 여부 — 목록에서 하트 표시용
  compact?: boolean;
  imageLoading?: 'eager' | 'lazy';
  onWishToggle?: () => void | Promise<void>;
}

// ─────────────────────────────────────────────────
// 카테고리 이름 → 배경색 매핑
// 요청 클래스 카드의 이미지 영역 배경으로 사용됩니다.
// ─────────────────────────────────────────────────
const CATEGORY_BG: Record<string, string> = {
  '뷰티·패션':   'bg-pink-100',
  '음악·악기':   'bg-purple-100',
  '미술·공예':   'bg-orange-100',
  '댄스·연기':   'bg-red-100',
  '어학·교육':   'bg-blue-100',
  '스포츠·레저': 'bg-green-100',
  '게임':        'bg-indigo-100',
  '라이프·요리': 'bg-yellow-100',
  '기타':        'bg-gray-100',
};

// 카테고리 이름 → 아이콘 매핑
const getCategoryIcon = (name: string) => {
  const cls = 'w-16 h-16 opacity-40';
  switch (name) {
    case '뷰티·패션':   return <Sparkles className={cls} />;
    case '음악·악기':   return <Music className={cls} />;
    case '미술·공예':   return <Palette className={cls} />;
    case '댄스·연기':   return <Drama className={cls} />;
    case '어학·교육':   return <Languages className={cls} />;
    case '스포츠·레저': return <Trophy className={cls} />;
    case '게임':        return <Gamepad2 className={cls} />;
    case '라이프·요리': return <Utensils className={cls} />;
    default:            return <MoreHorizontal className={cls} />;
  }
};

const ExplorerItemCard: React.FC<ExplorerItemCardProps> = ({
  id,
  image,
  title,
  value,
  valueLabel,
  personName,
  personLabel,
  personId,
  category,
  categoryName,
  type = 'class',
  location,
  timeSlot,
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
  const isEnrolled = enrollmentStatus && enrollmentStatus !== 'CANCELLED';

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={cn(
        "bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group",
        compact && "rounded-[24px]"
      )}
    >
      <Link to={type === 'class' ? `/class/${id}` : `/request/${id}`}>

        {/* ── 이미지 / 배경 영역 ── */}
        <div className={cn("relative aspect-[4/3] overflow-hidden", compact && "aspect-[4/2.8]")}>

          {type === 'request' ? (
            // 요청 클래스: 이미지 대신 카테고리 색상 배경 + 아이콘
            // 이미지가 없는 요청 클래스 특성을 자연스럽게 표현합니다.
            <div className={`w-full h-full flex flex-col items-center justify-center gap-3
              ${CATEGORY_BG[categoryName] ?? 'bg-gray-100'}
              group-hover:brightness-95 transition-all duration-300`}
            >
              {getCategoryIcon(categoryName)}
              <span className="text-sm font-bold text-gray-500 tracking-wide">
                {categoryName}
              </span>
            </div>
          ) : (
            // 일반 클래스: 기존 이미지 그대로
            <SafeImage
              src={image}
              alt={title}
              loading={imageLoading}
              decoding="async"
              sizes={compact ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          )}

          {/* 카테고리 뱃지 (좌측 상단) */}
          <div className="absolute top-4 left-4 z-10">
            <div className={cn(
              "px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-[13px] font-bold text-white shadow-sm w-fit",
              compact && "px-2.5 py-1 text-[12px]"
            )}>
              {categoryName}
            </div>
          </div>

          {/* 모집 상태 뱃지 (우측 상단) */}
          {type === 'class' && (isEnrolled || status !== 'OPEN') && (
            <div className={cn(
              "absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm w-fit flex-shrink-0 whitespace-nowrap text-white",
              isEnrolled ? "bg-green-500" : "bg-gray-400",
              compact && "px-2.5 py-0.5 text-[10px]",
              isWished && "right-14" // 하트 아이콘이 있을 경우 왼쪽으로 이동
            )}>
              {isEnrolled ? '신청 완료' : '모집마감'}
            </div>
          )}

          {/* 찜 하트 아이콘 — 찜한 클래스에만 표시 */}
          {isWished && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onWishToggle?.();
              }}
              className={cn(
                "absolute top-4 right-4 z-10 rounded-full bg-white/90 p-2 text-coral shadow-sm transition hover:bg-white",
                !onWishToggle && "cursor-default"
              )}
            >
              <Heart size={compact ? 18 : 22} className="fill-coral text-coral drop-shadow" />
            </button>
          )}
        </div>

        {/* ── 카드 하단 텍스트 영역 ── */}
        <div className={cn("p-6", compact && "p-4")}>
          <p className={cn("text-xs text-gray-400 mb-1 font-medium", compact && "text-[11px]")}>{personName}</p>
          <h3 className={cn(
            "font-bold text-gray-900 text-[18px] mb-2 line-clamp-2 group-hover:text-coral transition-colors leading-snug h-[2.8em]",
            compact && "text-[16px] mb-1.5 h-[2.6em]"
          )}>
            {title}
          </h3>

          {/* 요청 클래스는 별점 대신 온/오프라인 표시 */}
          {type === 'request' ? (
            <div className={cn("flex items-center gap-1 mb-4", compact && "mb-3")}>
              <span className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-lg",
                lessonType === '온라인'
                  ? 'bg-blue-50 text-blue-500'
                  : lessonType === '오프라인'
                    ? 'bg-orange-50 text-orange-500'
                    : 'text-gray-400 font-medium',
                compact && "text-[11px]"
              )}>
                {lessonType ?? '온/오프라인 협의'}
              </span>
            </div>
          ) : (
            <div className={cn("flex items-center gap-1 mb-4", compact && "mb-3")}>
              <Star size={compact ? 12 : 14} className="fill-yellow-400 text-yellow-400" />
              <span className={cn("text-sm font-bold text-gray-900", compact && "text-[13px]")}>{rating || 0}</span>
              <span className={cn("text-[13px] text-gray-400", compact && "text-[11px]")}>({reviews || 0})</span>
            </div>
          )}

          <div className={cn("pt-4 border-t border-gray-50 flex justify-between items-center", compact && "pt-3")}>
            <span className={cn("text-lg font-bold text-gray-900", compact && "text-base")}>
              {value.toLocaleString()}원
            </span>
            {location && (
              <span className={cn("text-[10px] text-gray-400 font-medium", compact && "text-[9px]")}>
                {location}
              </span>
            )}
          </div>
        </div>

      </Link>
    </motion.div>
  );
};

export default React.memo(ExplorerItemCard);
