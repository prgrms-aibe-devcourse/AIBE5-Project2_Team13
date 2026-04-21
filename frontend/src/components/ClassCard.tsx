import React from 'react';
import { Star } from 'lucide-react';
import { ClassItem, CATEGORIES } from '@/src/constants';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import SafeImage from '../components/SafeImage';
interface ClassCardProps {
  item: ClassItem;
}

const ClassCard: React.FC<ClassCardProps> = ({ item }) => {
  const categoryName = CATEGORIES.find(c => c.id === item.category)?.name || '기타';

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
    >
      <Link to={`/class/${item.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <SafeImage
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white shadow-sm">
            {categoryName}
          </div>
        </div>
        <div className="p-6">
          <p className="text-xs text-gray-400 mb-1 font-medium">{item.freelancer}</p>
          <h3 className="font-bold text-gray-900 text-[18px] mb-2 line-clamp-2 group-hover:text-coral transition-colors leading-tight">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 mb-4">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-gray-900">{item.rating}</span>
            <span className="text-xs text-gray-400">({item.reviews})</span>
          </div>
          <div className="pt-4 border-t border-gray-50">
            <span className="text-lg font-bold text-gray-900">
              {item.price.toLocaleString()}원
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ClassCard;
