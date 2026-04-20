import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Send, Image as ImageIcon, X, Calendar, MapPin, Users as UsersIcon, CreditCard, Save, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useClasses } from '../context/ClassContext';
import { useCategories } from '../context/CategoryContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '@/src/lib/utils';

// 입력된 텍스트를 분석하여 주차별 커리큘럼 미리보기를 생성하는 컴포넌트
function CurriculumForm({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const lines = value.split('\n').filter(line => line.trim() !== '');
  const items = [];
  
  // 2줄씩 한 세트로 묶어서 주차별 제목/설명 생성
  for (let i = 0; i < lines.length; i += 2) {
    items.push({
      title: lines[i],
      description: lines[i + 1] || ''
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 ml-1">상세 커리큘럼</label>
        <textarea 
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="수업이 어떻게 진행되는지 단계별로 설명해주세요.&#10;홀수 줄은 [주차 제목], 짝수 줄은 [주차 설명]으로 표시됩니다.&#10;예:&#10;오리엔테이션&#10;클래스 소개 및 준비물 안내"
          className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all min-h-[180px] resize-none"
        />
      </div>

      {/* 실시간 커리큘럼 미리보기 영역 */}
      {items.length > 0 && (
        <div className="mt-6 space-y-4 p-6 bg-ivory/30 rounded-[32px] border border-coral/5">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Check size={18} className="text-coral" />
            커리큘럼 미리보기
          </h3>
          <div className="space-y-3">
            {items.map((item, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={index}
                className="flex items-start gap-5 p-5 bg-white rounded-3xl border border-coral/10 shadow-sm"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-coral/10 text-coral rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-bold text-gray-900 mb-1">
                    {index + 1}주차: {item.title.trim()}
                  </h4>
                  {item.description && (
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {item.description.trim()}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClassFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addClass, updateClass, classes } = useClasses();
  const { categories } = useCategories();
  const { isLoggedIn, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isEditMode = !!id;
  const existingClass = isEditMode ? classes.find(c => c.id === id) : null;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [curriculum, setCurriculum] = useState('');
  const [method, setMethod] = useState('online');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('1');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && existingClass && categories.length > 0) {
      setTitle(existingClass.title);
      const matchedCategory = categories.find(cat => cat.name === existingClass.category);
      setCategory(matchedCategory ? String(matchedCategory.id) : '');
      setPrice(existingClass.price.toString());
      setMethod(existingClass.isOffline ? 'offline' : 'online');
      setLocation(existingClass.location || '');
      setImages([existingClass.image]);
      // Fill fields with existing data from class_board
      setContent((existingClass as any).description || '');
      setCurriculum((existingClass as any).curriculum || '');
      // Parse dates from ISO format
      if (existingClass.startAt) {
        setStartDate(existingClass.startAt.split('T')[0]);
      }
      if (existingClass.endAt) {
        setEndDate(existingClass.endAt.split('T')[0]);
      }
      setCapacity(String(existingClass.maxCapacity || ''));
    } else if (!isEditMode && !category && categories.length > 0) {
      setCategory(String(categories[0].id));
    }
  }, [isEditMode, existingClass, categories]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const currentImageCount = images.length;
      
      newFiles.forEach((file: File, index: number) => {
        if (currentImageCount + index < 10) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImages(prev => [...prev, reader.result as string].slice(0, 10));
          };
          reader.readAsDataURL(file);
          setImageFiles(prev => [...prev, file].slice(0, 10));
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) {
      setToast('로그인 상태를 확인 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    if (!isLoggedIn) {
      setToast('로그인 후 클래스 등록이 가능합니다.');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (isEditMode && id) {
      if (!isLoggedIn) {
        setToast('로그인 후 클래스 수정이 가능합니다.');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      try {
        await updateClass(id, {
          title,
          categoryId: Number(category),
          price: Number(price),
          isOnline: method === 'online',
          location: method === 'offline' ? location : undefined,
          description: content,
          curriculum: curriculum,
          startAt: `${startDate}T00:00:00`,
          endAt: `${endDate}T00:00:00`,
          maxCapacity: Number(capacity),
        });
        setToast('수정되었습니다.');
        setTimeout(() => navigate('/profile'), 1500);
      } catch (error) {
        setToast('수정 중 오류가 발생했습니다.');
      }
      return;
    }

    const createPayload = {
      title,
      description: content,
      categoryId: Number(category),
      price: Number(price),
      isOnline: method === 'online',
      startAt: `${startDate}T00:00:00`,
      endAt: `${endDate}T00:00:00`,
      maxCapacity: Number(capacity),
      curriculum,
      location: method === 'offline' ? location : undefined,
      images: imageFiles,
    };

    try {
      await addClass(createPayload);
      setToast('클래스가 성공적으로 등록되었습니다!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;
      if (status === 401) {
        setToast(message || '인증이 필요합니다. 로그인 페이지로 이동합니다.');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      if (status === 403) {
        setToast(message || '접근 권한이 없습니다.');
        return;
      }
      console.error('클래스 등록 실패:', error);
      if (error?.response?.status === 403) {
        setToast('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      setToast('클래스 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
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
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditMode ? '클래스 수정하기' : '새 클래스 등록하기'}
          </h1>
          <p className="text-gray-500">
            {isEditMode ? '클래스 정보를 최신으로 업데이트해보세요.' : '당신의 재능을 나눌 멋진 클래스를 만들어보세요.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} method="POST" className="space-y-10">
          {/* 기본 정보 섹션 */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-coral rounded-full"></span>
              기본 정보
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">클래스 제목</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="클래스의 핵심을 담은 제목을 입력해주세요"
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
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </section>

          {/* 클래스 내용 섹션 */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-coral rounded-full"></span>
              클래스 소개
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">클래스 설명</label>
              <textarea 
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="클래스의 특징과 장점을 상세히 적어주세요."
                className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all min-h-[150px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">이미지 첨부 (최대 10장)</label>
              <input 
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {images.length < 10 && (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-ivory border-2 border-dashed border-coral/20 rounded-2xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-coral/40 transition-all"
                  >
                    <ImageIcon size={24} />
                    <span className="text-[10px] font-bold">{images.length}/10</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* 일정 및 방식 섹션 */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-coral rounded-full"></span>
              일정 및 수업 방식
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-1">
                  <Calendar size={14} /> 시작일
                </label>
                <input 
                  type="date" 
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-1">
                  <Calendar size={14} /> 종료일
                </label>
                <input 
                  type="date" 
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">수업 방식</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setMethod('online')}
                    className={cn(
                      "flex-1 py-4 rounded-2xl font-bold border-2 transition-all",
                      method === 'online' ? "bg-coral text-white border-coral shadow-lg shadow-coral/20" : "bg-white text-gray-400 border-coral/10 hover:border-coral/30"
                    )}
                  >
                    온라인
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('offline')}
                    className={cn(
                      "flex-1 py-4 rounded-2xl font-bold border-2 transition-all",
                      method === 'offline' ? "bg-coral text-white border-coral shadow-lg shadow-coral/20" : "bg-white text-gray-400 border-coral/10 hover:border-coral/30"
                    )}
                  >
                    오프라인
                  </button>
                </div>
              </div>
              {method === 'offline' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-1">
                    <MapPin size={14} /> 수업 지역
                  </label>
                  <input 
                    type="text" 
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="예: 서울 강남구"
                    className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all"
                  />
                </div>
              )}
            </div>
          </section>

          {/* 커리큘럼 및 인원 섹션 */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-coral rounded-full"></span>
              상세 커리큘럼 및 인원
            </h2>
            
            <CurriculumForm value={curriculum} onChange={setCurriculum} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-1">
                  <UsersIcon size={14} /> 모집 인원
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all pr-12"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">명</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-1">
                  <CreditCard size={14} /> 수강료 (1인 기준)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="예: 50000"
                    className="w-full px-6 py-4 bg-ivory rounded-2xl border-2 border-transparent focus:border-coral outline-none transition-all pr-12"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">원</span>
                </div>
              </div>
            </div>
          </section>

          {/* 하단 버튼 */}
          <div className="flex gap-4 pt-6">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-5 bg-gray-100 text-gray-500 font-bold rounded-3xl hover:bg-gray-200 transition-all text-lg"
            >
              취소
            </button>
            <button 
              type="submit"
              className="flex-[2] py-5 bg-coral text-white font-bold rounded-3xl hover:bg-coral/90 transition-all shadow-xl shadow-coral/30 flex items-center justify-center gap-2 text-lg"
            >
              {isEditMode ? <Save size={22} /> : <Send size={22} />}
              {isEditMode ? '저장하기' : '클래스 등록하기'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl font-bold text-white bg-gray-900 flex items-center gap-3 min-w-[300px] justify-center"
          >
            <Check size={20} className="text-green-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
