import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
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
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
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
        <div className="p-6">
          <p className="text-xs text-gray-400 mb-1 font-medium">{personName}</p>
          <h3 className="font-bold text-gray-900 text-[18px] mb-2 line-clamp-2 group-hover:text-coral transition-colors leading-snug h-[2.8em]">
            {title}
          </h3>
          <div className="flex items-center gap-1 mb-4">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-900">{rating || 0}</span>
            <span className="text-[13px] text-gray-400">({reviews || 0})</span>
          </div>
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
