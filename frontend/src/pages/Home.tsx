import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Sparkles, TrendingUp, ChevronRight, Dumbbell, Palette, Utensils, Music, Scissors, Camera, MapPin, Gamepad2, Languages, Trophy, Drama, MoreHorizontal } from 'lucide-react';
import { CATEGORIES } from '@/src/constants';
import { cn } from '@/src/lib/utils';
import ClassCard from '@/src/components/ClassCard';
import TasteAnalysis from '@/src/components/TasteAnalysis';
import { useClasses } from '../context/ClassContext';

export default function Home() {
  const { classes } = useClasses();
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden flex items-center justify-center bg-ivory">
        <div className="w-full relative z-10">
          <div className="relative aspect-[718/500] w-full bg-white overflow-hidden shadow-2xl group">
            <iframe 
              src="https://my.spline.design/untitled-VbzxxqwbGN2jmPzKadbNrTYd-COq/" 
              className="absolute inset-0 w-full h-full border-0 pointer-events-auto"
              title="Spline 3D Scene"
            />
            
            {/* Content Overlay - Using pointer-events-none so users can still interact with Spline if they click the background, but buttons remain clickable */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/5 pointer-events-none">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="pointer-events-none -translate-y-22"
                          >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md text-white font-bold rounded-full text-xs md:text-sm mb-6 border border-white/30 shadow-lg">
                              <span>✨</span> 안경 너머로 찾은 나만의 포근함
                            </div>
                            <h1 className="text-4xl md:text-7xl font-bold text-white leading-[1.2] mb-6 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                              당신의 취미가 <br />
                              <span className="text-coral">특별해지는 순간</span>
                            </h1>
                            <p className="text-base md:text-2xl text-white/95 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] font-medium">
                              검증된 전문가와 함께 <br />
                              당신의 일상을 다채롭게 채워보세요.
                            </p>
                            <div className="flex justify-center">
	                              <Link
	                                to="/browse"
	                                className="pointer-events-auto px-12 py-5 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all shadow-xl shadow-coral/30 text-lg md:text-2xl hover:scale-105 active:scale-95"
	                              >
                                클래스 찾아보기
                              </Link>
                            </div>
                          </motion.div>
                        </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
	      {/* hero 줄이는 부분 */}
      <section className="relative z-20 -mt-28 md:-mt-36 pt-20 pb-20 bg-white rounded-t-[40px] shadow-[0_-18px_40px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">어떤 취미를 배우고 싶나요?</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
            {[
              { id: 'beauty', name: '뷰티·패션', icon: <Sparkles size={24} />, bgColor: 'bg-pink-50', iconColor: 'text-pink-500' },
              { id: 'music', name: '음악·악기', icon: <Music size={24} />, bgColor: 'bg-purple-50', iconColor: 'text-purple-500' },
              { id: 'art', name: '미술·공예', icon: <Palette size={24} />, bgColor: 'bg-yellow-50', iconColor: 'text-yellow-600' },
              { id: 'dance', name: '댄스·연기', icon: <Camera size={24} />, bgColor: 'bg-red-50', iconColor: 'text-red-500' },
              { id: 'edu', name: '어학·교육', icon: <Languages size={24} />, bgColor: 'bg-blue-50', iconColor: 'text-blue-500' },
              { id: 'sports', name: '스포츠·레저', icon: <Dumbbell size={24} />, bgColor: 'bg-green-50', iconColor: 'text-green-500' },
              { id: 'game', name: '게임', icon: <Gamepad2 size={24} />, bgColor: 'bg-indigo-50', iconColor: 'text-indigo-500' },
              { id: 'life', name: '라이프·요리', icon: <Utensils size={24} />, bgColor: 'bg-orange-50', iconColor: 'text-orange-500' },
              { id: 'etc', name: '기타', icon: <MoreHorizontal size={24} />, bgColor: 'bg-gray-50', iconColor: 'text-gray-500' },
            ].map((cat, idx) => (
              <Link
                key={cat.id}
                to={`/browse?category=${cat.id}`}
                className="group"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex flex-col items-center justify-center p-6 bg-[#F8F9FA] rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 h-full"
                >
                  <div className={cn(
                    "w-14 h-14 flex items-center justify-center rounded-full mb-4 transition-transform group-hover:scale-110",
                    cat.bgColor,
                    cat.iconColor
                  )}>
                    {cat.icon}
                  </div>
                  <span className="text-[16px] font-bold text-gray-600 group-hover:text-gray-900 whitespace-nowrap">{cat.name}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Ongoing Classes Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">진행 중인 클래스 🔥</h2>
              <p className="text-gray-500">지금 가장 많이 찾는 취미 전문가들을 만나보세요</p>
            </div>
            <Link to="/browse" className="text-gray-400 hover:text-coral font-bold flex items-center gap-1 transition-colors">
              전체보기 <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 모집중인 클래스(status === 'OPEN')만 필터링하여 상위 8개 노출 */}
            {classes.filter(item => item.status === 'OPEN').slice(0, 8).map((item) => (
              <ClassCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-ivory/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-gray-900">취미 매칭, 이렇게 진행돼요</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "원하는 취미 검색",
                desc: "다양한 카테고리에서 내가 배우고 싶은 취미와 전문가를 찾아보세요.",
                color: "bg-blue-600"
              },
              {
                step: 2,
                title: "전문가와 상담 및 결제",
                desc: "마음에 드는 전문가에게 문의하고 안전하게 결제를 진행하세요.",
                color: "bg-pink-500"
              },
              {
                step: 3,
                title: "즐거운 취미 생활 시작",
                desc: "온/오프라인으로 클래스를 수강하고 나만의 취미를 마스터해보세요!",
                color: "bg-yellow-400"
              }
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white rounded-[40px] p-10 text-center shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
              >
                <div className={`w-12 h-12 ${item.color} text-white font-bold rounded-2xl flex items-center justify-center mx-auto mb-8 text-xl shadow-lg`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                
                {/* Decorative background circle */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 ${item.color} opacity-[0.03] rounded-full group-hover:scale-110 transition-transform`}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Analysis Modal */}
      <TasteAnalysis isOpen={isAnalysisOpen} onClose={() => setIsAnalysisOpen(false)} />
    </div>
  );
}
