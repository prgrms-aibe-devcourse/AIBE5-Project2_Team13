import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORIES } from '@/src/constants';
import { useRequests } from '../context/RequestContext';

export default function RequestWrite() {
  const navigate = useNavigate();
  const { addRequest } = useRequests();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [lessonType, setLessonType] = useState('1:1');
  const [content, setContent] = useState('');
  const [reward, setReward] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addRequest({
      title,
      category,
      content,
      reward: Number(reward),
      author: '포근프리랜서', // Updated to freelancer for demo
      image: imagePreview || 'https://picsum.photos/seed/pogeun-request/400/300',
      location,
      timeSlot,
      lessonType,
    });

    alert('등록되었습니다');
    navigate('/requests');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-coral mb-8 transition-colors font-medium"
      >
        <ChevronLeft size={20} /> 뒤로가기
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-coral/5"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">클래스 요청하기</h1>
        <p className="text-gray-sub mb-10">찾으시는 클래스가 없다면 프리랜서들에게 직접 요청해보세요.</p>

        <form onSubmit={handleSubmit} method="POST" className="space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">요청 제목</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="어떤 클래스를 찾으시나요? (예: 주말 오전 수채화 클래스)"
              className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">카테고리</label>
            <select 
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all appearance-none"
            >
              <option value="">카테고리를 선택해주세요</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">희망 지역</label>
              <input 
                type="text" 
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 서울 강남구"
                className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">희망 시간대</label>
              <input 
                type="text" 
                required
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="예: 주말 오후"
                className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">레슨 형태</label>
              <select 
                required
                value={lessonType}
                onChange={(e) => setLessonType(e.target.value)}
                className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all appearance-none"
              >
                <option value="1:1">1:1 개인 레슨</option>
                <option value="Group">그룹 레슨</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">상세 내용</label>
            <textarea 
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="원하시는 커리큘럼, 장소, 시간대 등 상세한 조건을 적어주세요."
              className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all min-h-[200px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">이미지 첨부 (선택)</label>
            <input 
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            {imagePreview ? (
              <div className="relative w-full h-64 rounded-3xl overflow-hidden group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white text-gray-900 font-bold rounded-xl mr-2"
                  >
                    변경하기
                  </button>
                  <button 
                    type="button"
                    onClick={removeImage}
                    className="p-2 bg-red-500 text-white rounded-xl"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 bg-ivory border-2 border-dashed border-coral/20 rounded-3xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-coral/40 transition-all cursor-pointer"
              >
                <ImageIcon size={32} />
                <span className="text-sm font-medium">참고 이미지를 업로드해주세요</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">희망 사례금 (1회 기준)</label>
              <div className="relative">
                <input 
                  type="number" 
                  required
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="예: 50,000"
                  className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all pr-12"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">원</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">희망 인원</label>
              <div className="relative">
                <input 
                  type="number" 
                  defaultValue="1"
                  className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all pr-12"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">명</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              className="w-full py-5 bg-coral text-white font-bold rounded-3xl hover:bg-coral/90 transition-all shadow-xl shadow-coral/30 flex items-center justify-center gap-2 text-lg"
            >
              <Send size={22} /> 요청 등록하기
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
