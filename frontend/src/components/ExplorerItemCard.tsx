import React from 'react';
import { Star, Sparkles, Music, Palette, Drama, Languages, Trophy, Gamepad2, Utensils, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

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
  rating?: number;
  reviews?: number;
  status?: string;
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
  rating,
  reviews,
  status
}) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
    >
      <Link to={type === 'class' ? `/class/${id}` : `/request/${id}`}>

        {/* ── 이미지 / 배경 영역 ── */}
        <div className="relative aspect-[4/3] overflow-hidden">

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
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          )}

          {/* 카테고리 + 상태 뱃지 */}
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-[13px] font-bold text-white shadow-sm">
              {categoryName}
            </div>
            {status && (
              <div className="px-3 py-1 bg-coral text-white rounded-lg text-[13px] font-bold shadow-sm">
                {status}
              </div>
            )}
          </div>
        </div>

        {/* ── 카드 하단 텍스트 영역 ── */}
        <div className="p-6">
          <p className="text-xs text-gray-400 mb-1 font-medium">{personName}</p>
          <h3 className="font-bold text-gray-900 text-[18px] mb-2 line-clamp-2 group-hover:text-coral transition-colors leading-snug h-[2.8em]">
            {title}
          </h3>

          {/* 요청 클래스는 별점 대신 온/오프라인 표시 */}
          {type === 'request' ? (
            <div className="flex items-center gap-1 mb-4">
              <span className="text-xs font-medium text-gray-400">
                {timeSlot ?? '온/오프라인 협의'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 mb-4">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold text-gray-900">{rating || 0}</span>
              <span className="text-[13px] text-gray-400">({reviews || 0})</span>
            </div>
          )}

          <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">
              {value.toLocaleString()}원
            </span>
            {location && (
              <span className="text-[10px] text-gray-400 font-medium">
                {location}
              </span>
            )}
          </div>
        </div>

      </Link>
    </motion.div>
  );
};

export default ExplorerItemCard;
