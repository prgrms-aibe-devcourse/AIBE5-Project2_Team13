import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Upload, CheckCircle2, X, FileText, Link as LinkIcon, Video, Plus, Trash2 } from 'lucide-react';
import { useFreelancers } from '../context/FreelancerContext';

const SPECIALTIES = [
  '수채화', '가죽공예', '요가', '필라테스', '베이킹', '목공예', '드로잉', '사진', '외국어', '기타'
];

const REGIONS = [
  '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

export default function ExpertRegistrationForm() {
  const navigate = useNavigate();
  const { addApprovalRequest } = useFreelancers();
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    region: '',
    intro: '',
    portfolioText: '',
    portfolioUrl: '',
    videoUrl: '',
  });
  
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '이름/활동명을 입력해주세요.';
    if (!formData.specialty) newErrors.specialty = '전문 분야를 선택해주세요.';
    if (!formData.region) newErrors.region = '활동 지역을 선택해주세요.';
    if (!formData.intro.trim()) newErrors.intro = '상세 소개를 입력해주세요.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      addApprovalRequest({
        name: formData.name,
        email: 'haruyuki0479@gmail.com', // In a real app, this would be the logged-in user's email
        specialty: formData.specialty,
        career: formData.intro,
        portfolio: formData.portfolioUrl || formData.portfolioText || '첨부파일 확인 필요'
      });
      alert('프리랜서 등록 신청이 성공적으로 접수되었습니다!');
      navigate('/profile');
    }, 1500);
  };

  const handleDownloadGuide = () => {
    alert('프리랜서 가이드북(PDF) 다운로드를 시작합니다.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-coral transition-colors font-medium"
        >
          <ChevronLeft size={20} /> 뒤로가기
        </button>

        <button 
          onClick={handleDownloadGuide}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-coral/20 text-coral rounded-xl hover:bg-coral/5 transition-all text-sm font-bold shadow-sm"
        >
          <FileText size={18} /> 프리랜서 가이드북 다운로드
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-coral/5"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">프리랜서 등록 신청</h1>
          <p className="text-gray-sub">포근의 파트너가 되어 당신의 재능을 나누어주세요.</p>
        </div>

        <form onSubmit={handleSubmit} method="POST" className="space-y-10">
          {/* 기본 정보 */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-coral rounded-full"></span>
              기본 정보
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-3">이름 / 활동명 <span className="text-coral">*</span></label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 홍길동 또는 포근마스터"
                  className={`w-full px-6 py-4 bg-ivory border-2 rounded-2xl outline-none transition-all ${errors.name ? 'border-red-400' : 'border-transparent focus:border-coral'}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-2 ml-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">전문 분야 <span className="text-coral">*</span></label>
                <select 
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className={`w-full px-6 py-4 bg-ivory border-2 rounded-2xl outline-none transition-all appearance-none ${errors.specialty ? 'border-red-400' : 'border-transparent focus:border-coral'}`}
                >
                  <option value="">분야 선택</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.specialty && <p className="text-red-500 text-xs mt-2 ml-1">{errors.specialty}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">활동 지역 <span className="text-coral">*</span></label>
                <select 
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className={`w-full px-6 py-4 bg-ivory border-2 rounded-2xl outline-none transition-all appearance-none ${errors.region ? 'border-red-400' : 'border-transparent focus:border-coral'}`}
                >
                  <option value="">지역 선택</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.region && <p className="text-red-500 text-xs mt-2 ml-1">{errors.region}</p>}
              </div>
            </div>
          </section>

          {/* 상세 소개 */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-coral rounded-full"></span>
              상세 소개
            </h2>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">주요 경력 및 소개 <span className="text-coral">*</span></label>
              <textarea 
                value={formData.intro}
                onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                placeholder="자신의 경력이나 클래스 운영 경험, 전문성을 자유롭게 적어주세요."
                className={`w-full px-6 py-4 bg-ivory border-2 rounded-2xl outline-none transition-all min-h-[160px] resize-none ${errors.intro ? 'border-red-400' : 'border-transparent focus:border-coral'}`}
              ></textarea>
              {errors.intro && <p className="text-red-500 text-xs mt-2 ml-1">{errors.intro}</p>}
            </div>
          </section>

          {/* 포트폴리오 섹션 */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-coral rounded-full"></span>
              포트폴리오
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">포트폴리오 설명 (선택)</label>
                <textarea 
                  value={formData.portfolioText}
                  onChange={(e) => setFormData({ ...formData, portfolioText: e.target.value })}
                  placeholder="포트폴리오에 대한 설명을 입력해주세요."
                  className={`w-full px-6 py-4 bg-ivory border-2 rounded-2xl outline-none transition-all min-h-[100px] resize-none ${errors.portfolioText ? 'border-red-400' : 'border-transparent focus:border-coral'}`}
                ></textarea>
                {errors.portfolioText && <p className="text-red-500 text-xs mt-2 ml-1">{errors.portfolioText}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">포트폴리오 URL (선택)</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                    <LinkIcon size={18} />
                  </div>
                  <input 
                    type="url" 
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    placeholder="https://your-portfolio.com"
                    className="w-full pl-14 pr-6 py-4 bg-ivory border-2 border-transparent focus:border-coral rounded-2xl outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">이미지 첨부 (선택)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex flex-col items-center justify-center w-full py-10 border-2 border-dashed border-coral/20 rounded-[32px] cursor-pointer hover:bg-coral/5 transition-all group"
                >
                  <Upload className="w-12 h-12 text-coral/40 group-hover:text-coral transition-colors mb-4" />
                  <p className="text-gray-900 font-bold mb-1">파일을 드래그하거나 클릭하여 업로드하세요</p>
                  <p className="text-sm text-gray-400">JPG, PNG, PDF (최대 10MB)</p>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    multiple
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                </div>

                {/* 첨부 파일 리스트 시뮬레이션 */}
                {attachedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-ivory rounded-2xl border border-coral/5">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-coral" />
                          <span className="text-sm font-medium text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)}MB)</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">영상 링크 (선택)</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                    <Video size={18} />
                  </div>
                  <input 
                    type="url" 
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="YouTube 또는 Vimeo 링크"
                    className="w-full pl-14 pr-6 py-4 bg-ivory border-2 border-transparent focus:border-coral rounded-2xl outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="pt-8">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-coral text-white font-bold rounded-[32px] hover:bg-coral/90 transition-all shadow-xl shadow-coral/30 flex items-center justify-center gap-2 text-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>프리랜서 등록 신청하기</>
              )}
            </button>
            <p className="text-center text-sm text-gray-400 mt-4">
              신청 후 관리자 승인까지 영업일 기준 1~3일이 소요될 수 있습니다.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

