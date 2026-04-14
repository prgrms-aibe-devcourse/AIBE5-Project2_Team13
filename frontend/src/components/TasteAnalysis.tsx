import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Loader2, ChevronRight, Sparkle } from 'lucide-react';
import { MOCK_CLASSES } from '@/src/constants';
import ClassCard from './ClassCard';
import { cn } from '@/src/lib/utils';

interface TasteAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOADING_MESSAGES = [
  "당신의 취향을 포근하게 분석하고 있어요...",
  "당신과 어울리는 활동적인 공간을 찾는 중이에요...",
  "마음이 편안해지는 취미 리스트를 살펴보고 있어요...",
  "거의 다 됐어요! 당신만을 위한 특별한 추천입니다."
];

export default function TasteAnalysis({ isOpen, onClose }: TasteAnalysisProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [selections, setSelections] = useState({
    place: '',
    people: ''
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setLoading(false);
      setSelections({ place: '', people: '' });
      setLoadingMessageIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleSelect = (key: 'place' | 'people', value: string) => {
    const newSelections = { ...selections, [key]: value };
    setSelections(newSelections);
    
    if (newSelections.place && newSelections.people) {
      setLoading(true);
      setStep(2);
      setTimeout(() => {
        setLoading(false);
        setStep(3);
      }, 3200);
    }
  };

  const getReasoning = (index: number) => {
    if (index === 0) {
      return selections.place === 'indoor' 
        ? "차분한 실내 활동을 선호하시는 당신께, 마음의 평온을 줄 수 있는 이 클래스를 추천해요."
        : "활동적인 실외 활동을 좋아하시는 당신께, 에너지를 발산할 수 있는 이 클래스가 딱이에요.";
    }
    return selections.people === 'solo'
      ? "혼자만의 집중 시간을 소중히 여기시는 당신을 위해 준비한 특별한 클래스입니다."
      : "새로운 사람들과 즐겁게 교류하며 활력을 얻고 싶은 당신께 이 클래스를 추천드려요.";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-3xl bg-ivory rounded-[40px] shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-2 text-gray-400 hover:text-coral transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-10 md:p-16">
          {step === 1 && (
            <div className="space-y-10">
              <div className="text-center">
                <div className="inline-flex p-4 bg-coral/10 rounded-3xl mb-6">
                  <Sparkles className="text-coral" size={40} />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">나의 취미 찾기</h2>
                <p className="text-gray-sub text-lg">당신이 선호하는 활동 스타일을 선택해주세요.</p>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-center font-bold text-gray-900 mb-4">어디서 활동하고 싶나요?</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleSelect('place', 'indoor')}
                      className={cn(
                        "p-6 bg-white rounded-3xl border-2 transition-all text-center group",
                        selections.place === 'indoor' ? "border-coral shadow-lg" : "border-transparent hover:border-coral/30"
                      )}
                    >
                      <span className="block text-3xl mb-2">🏠</span>
                      <span className="font-bold text-gray-900">실내에서 차분하게</span>
                    </button>
                    <button
                      onClick={() => handleSelect('place', 'outdoor')}
                      className={cn(
                        "p-6 bg-white rounded-3xl border-2 transition-all text-center group",
                        selections.place === 'outdoor' ? "border-coral shadow-lg" : "border-transparent hover:border-coral/30"
                      )}
                    >
                      <span className="block text-3xl mb-2">🌳</span>
                      <span className="font-bold text-gray-900">실외에서 활기차게</span>
                    </button>
                  </div>
                </div>

                {selections.place && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="text-center font-bold text-gray-900 mb-4">누구와 함께하고 싶나요?</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleSelect('people', 'solo')}
                        className={cn(
                          "p-6 bg-white rounded-3xl border-2 transition-all text-center group",
                          selections.people === 'solo' ? "border-coral shadow-lg" : "border-transparent hover:border-coral/30"
                        )}
                      >
                        <span className="block text-3xl mb-2">👤</span>
                        <span className="font-bold text-gray-900">혼자서 집중하며</span>
                      </button>
                      <button
                        onClick={() => handleSelect('people', 'group')}
                        className={cn(
                          "p-6 bg-white rounded-3xl border-2 transition-all text-center group",
                          selections.people === 'group' ? "border-coral shadow-lg" : "border-transparent hover:border-coral/30"
                        )}
                      >
                        <span className="block text-3xl mb-2">👥</span>
                        <span className="font-bold text-gray-900">여럿이 즐겁게</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-24 text-center space-y-8">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex w-24 h-24 bg-coral rounded-[32px] items-center justify-center shadow-2xl shadow-coral/30"
              >
                <span className="text-white font-bold text-4xl">포</span>
              </motion.div>
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-gray-900">포근이가 분석 중입니다...</h3>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingMessageIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-gray-sub text-lg h-8"
                  >
                    {LOADING_MESSAGES[loadingMessageIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-3 h-3 bg-coral rounded-full"
                  />
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex w-16 h-16 bg-coral rounded-2xl items-center justify-center shadow-lg mb-4"
                >
                  <span className="text-white font-bold text-2xl">포</span>
                </motion.div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">분석 완료! ✨</h2>
                <p className="text-gray-sub text-lg">당신을 위한 포근한 추천 클래스입니다.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {MOCK_CLASSES.slice(0, 2).map((item, index) => (
                  <div key={item.id} className="space-y-4">
                    <div className="bg-coral/5 p-4 rounded-2xl border border-coral/10 relative">
                      <div className="absolute -top-3 -left-2">
                        <Sparkle className="text-coral fill-coral" size={20} />
                      </div>
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">
                        <span className="text-coral font-bold">포근 AI가 분석했어요:</span><br />
                        {getReasoning(index)}
                      </p>
                    </div>
                    <ClassCard item={item} />
                  </div>
                ))}
              </div>

              <div className="text-center pt-4">
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-10 py-5 bg-coral text-white font-bold rounded-3xl hover:bg-coral/90 transition-all shadow-xl shadow-coral/30 text-lg"
                >
                  다른 클래스 더 보기 <ChevronRight size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
