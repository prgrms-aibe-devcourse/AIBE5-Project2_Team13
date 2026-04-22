import React, { useState, useEffect } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { ReviewItem } from '@/src/constants';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (review: Partial<ReviewItem>) => void | Promise<void>;
  mode: 'create' | 'edit';
  initialData?: Partial<ReviewItem>;
}

export default function ReviewModal({ isOpen, onClose, onSave, mode, initialData }: ReviewModalProps) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [content, setContent] = useState(initialData?.content || '');
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRating(initialData?.rating || 0);
      setContent(initialData?.content || '');
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        rating,
        content,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[40px] p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-coral transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === 'create' ? '리뷰 작성하기' : '리뷰 수정하기'}
            </h2>
            <p className="text-gray-500 mb-8">{initialData?.className}</p>
            
            <div className="space-y-8">
              {/* Star Rating */}
              <div className="text-center">
                <label className="block text-sm font-bold text-gray-700 mb-4">클래스는 어떠셨나요?</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star 
                        size={40} 
                        className={cn(
                          "transition-colors",
                          (hoverRating || rating) >= star 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-200"
                        )} 
                      />
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-sm font-bold text-coral">
                  {rating === 5 ? '최고예요!' : rating === 4 ? '좋아요!' : rating === 3 ? '보통이에요' : rating === 2 ? '그저 그래요' : rating === 1 ? '별로예요' : '평가해주세요'}
                </p>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-4">상세 리뷰</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-6 py-4 bg-ivory rounded-3xl border-2 border-transparent focus:border-coral outline-none transition-all min-h-[150px] resize-none text-gray-700 leading-relaxed"
                  placeholder="클래스는 어떠셨나요? 솔직한 리뷰를 남겨주세요. (최소 10자 이상)"
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-5 bg-gray-100 text-gray-500 font-bold rounded-3xl hover:bg-gray-200 transition-all text-lg"
                >
                  취소
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-[2] py-5 bg-coral text-white font-bold rounded-3xl hover:bg-coral/90 transition-all shadow-xl shadow-coral/30 text-lg"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin" />
                      저장 중
                    </span>
                  ) : mode === 'create' ? '등록하기' : '수정 완료'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
