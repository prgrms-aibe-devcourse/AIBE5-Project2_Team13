import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, FileText, BookOpen, CreditCard, ImagePlus, X } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useCategories } from '../context/CategoryContext';
import { applyFreelancerProfile, getFreelancerApplicationStatus } from '@/src/api/freelancerRegistration';
import { uploadFreelancerPortfolioImages } from '@/src/api/freelancerProfile';
import axios from 'axios';
import { clearStoredFreelancerApplicationStatus, getStoredFreelancerApplicationStatus, setStoredFreelancerApplicationStatus } from '@/src/lib/freelancerApplication';

type PortfolioDraftImage = {
  // 등록 전 단계에서는 아직 서버 fileId가 없으므로 File과 preview URL만 들고 갑니다.
  file: File;
  previewUrl: string;
};

const MAX_PORTFOLIO_IMAGES = 10;

export default function ExpertRegistrationForm() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    memberName: user?.name || '',
    specialtyCategoryId: '' as number | '',
    bio: '',
    career: '',
    snsLink: '',
    bankAccount: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasPendingFreelancerApplication, setHasPendingFreelancerApplication] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<PortfolioDraftImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioImagesRef = useRef<PortfolioDraftImage[]>([]);

  useEffect(() => {
    if (user?.role !== 'USER') {
      setHasPendingFreelancerApplication(false);
      clearStoredFreelancerApplicationStatus();
      return;
    }

    let isMounted = true;
    setHasPendingFreelancerApplication(getStoredFreelancerApplicationStatus() === 'W');

    getFreelancerApplicationStatus()
      .then((status) => {
        if (isMounted) {
          if (status.approvalStatusCode) {
            setStoredFreelancerApplicationStatus(status.approvalStatusCode);
          } else {
            clearStoredFreelancerApplicationStatus();
          }
          setHasPendingFreelancerApplication(status.approvalStatusCode === 'W');
        }
      })
      .catch(() => {
        if (isMounted) {
          setHasPendingFreelancerApplication(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.role]);

  if (loading) {
    return null;
  }

  if (user?.role !== 'USER') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="bg-white rounded-[40px] p-10 border border-coral/10 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">프리랜서 등록은 회원만 신청할 수 있습니다.</h1>
          <p className="text-gray-500 mb-8">회원 계정으로 로그인한 뒤 프리랜서 등록을 진행해주세요.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  if (hasPendingFreelancerApplication) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="bg-white rounded-[40px] p-10 border border-coral/10 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">이미 프리랜서 등록을 신청했습니다.</h1>
          <p className="text-gray-500 mb-8">현재 승인 대기 상태입니다. 관리자 승인 후 프리랜서 권한이 활성화됩니다.</p>
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-3 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all"
          >
            마이페이지로 이동
          </button>
        </div>
      </div>
    );
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.memberName.trim()) nextErrors.memberName = '활동명을 입력해주세요.';
    if (formData.specialtyCategoryId === '') nextErrors.specialtyCategoryId = '전문 분야를 선택해주세요.';
    if (!formData.career.trim()) nextErrors.career = '경력 사항을 입력해주세요.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAddPortfolioImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    const remainingCount = MAX_PORTFOLIO_IMAGES - portfolioImages.length;
    if (remainingCount <= 0) {
      setErrors((prev) => ({ ...prev, portfolioImages: `포트폴리오 이미지는 최대 ${MAX_PORTFOLIO_IMAGES}장까지 등록할 수 있습니다.` }));
      event.target.value = '';
      return;
    }

    // 등록 전에는 프론트 미리보기만 필요하므로 로컬 object URL을 만들어 카드로 보여줍니다.
    const nextFiles = selectedFiles.slice(0, remainingCount).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPortfolioImages((prev) => [...prev, ...nextFiles]);
    setErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors.portfolioImages;
      return nextErrors;
    });
    event.target.value = '';
  };

  const handleRemovePortfolioImage = (index: number) => {
    setPortfolioImages((prev) => {
      const target = prev[index];
      if (target) {
        // 미리보기용 blob URL은 제거 시 바로 정리해 메모리 누수를 막습니다.
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setIsSubmitting(true);
      const profileId = await applyFreelancerProfile({
        memberName: formData.memberName,
        specialtyCategoryId: Number(formData.specialtyCategoryId),
        bio: formData.bio,
        career: formData.career,
        snsLink: formData.snsLink.trim() || undefined,
        bankAccount: formData.bankAccount,
      });

      // 프리랜서 프로필이 먼저 생성되어야 첨부 대상을 freelancer_profile_id로 지정할 수 있습니다.
      if (portfolioImages.length > 0) {
        await uploadFreelancerPortfolioImages(profileId, portfolioImages.map((image) => image.file));
      }

      setStoredFreelancerApplicationStatus('W');
      alert('프리랜서 등록 신청이 접수되었습니다. 관리자 승인 후 프리랜서 자격이 활성화됩니다.');
      navigate('/profile');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || '프리랜서 등록 신청 중 오류가 발생했습니다.');
      } else {
        alert('프리랜서 등록 신청 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    portfolioImagesRef.current = portfolioImages;
  }, [portfolioImages]);

  useEffect(() => {
    return () => {
      // 페이지 이탈 시 아직 서버에 저장되지 않은 미리보기 URL을 정리합니다.
      portfolioImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

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
          type="button"
          onClick={() => alert('프리랜서 가이드북(PDF) 다운로드를 시작합니다.')}
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
          <p className="text-gray-sub">신청 시 프리랜서 프로필이 생성되고, 승인 전까지는 회원 권한이 유지됩니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-coral rounded-full"></span>
              기본 정보
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">활동명 <span className="text-coral">*</span></label>
                <input
                  type="text"
                  value={formData.memberName}
                  onChange={(e) => setFormData(prev => ({ ...prev, memberName: e.target.value }))}
                  className="w-full px-6 py-4 bg-ivory border-2 border-transparent focus:border-coral rounded-2xl outline-none transition-all"
                  placeholder="활동명을 입력해주세요."
                />
                {errors.memberName && <p className="text-red-500 text-xs mt-2 ml-1">{errors.memberName}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">전문 분야 <span className="text-coral">*</span></label>
                <select
                  value={formData.specialtyCategoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialtyCategoryId: e.target.value === '' ? '' : Number(e.target.value) }))}
                  className="w-full px-6 py-4 bg-ivory border-2 border-transparent focus:border-coral rounded-2xl outline-none transition-all appearance-none"
                >
                  <option value="">분야 선택</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {errors.specialtyCategoryId && <p className="text-red-500 text-xs mt-2 ml-1">{errors.specialtyCategoryId}</p>}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-coral rounded-full"></span>
              소개 및 경력
            </h2>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">한 줄 소개</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="자신을 소개하는 문장을 입력해주세요."
                className="w-full px-6 py-4 bg-ivory border-2 border-transparent focus:border-coral rounded-2xl outline-none transition-all min-h-[120px] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">경력 사항 <span className="text-coral">*</span></label>
              <textarea
                value={formData.career}
                onChange={(e) => setFormData(prev => ({ ...prev, career: e.target.value }))}
                placeholder="경력과 전문성을 입력해주세요."
                className="w-full px-6 py-4 bg-ivory border-2 border-transparent focus:border-coral rounded-2xl outline-none transition-all min-h-[180px] resize-none"
              />
              {errors.career && <p className="text-red-500 text-xs mt-2 ml-1">{errors.career}</p>}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-coral rounded-full"></span>
              부가 정보
            </h2>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">포트폴리오 링크</label>
              <div className="relative">
                <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={formData.snsLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, snsLink: e.target.value }))}
                  placeholder="https://..."
                  className="w-full pl-12 pr-6 py-4 bg-ivory border-2 border-transparent focus:border-coral rounded-2xl outline-none transition-all"
                  autoComplete="off"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-1">선택 입력입니다. 링크 없이 포트폴리오 이미지만 등록해도 됩니다.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">포트폴리오 이미지</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {portfolioImages.map((image, index) => (
                  <div key={`${image.file.name}-${index}`} className="relative aspect-square rounded-[28px] overflow-hidden border border-coral/10 bg-white shadow-sm">
                    <img src={image.previewUrl} alt={image.file.name} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePortfolioImage(index)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/75 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}

                {portfolioImages.length < MAX_PORTFOLIO_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-[28px] border-2 border-dashed border-coral/25 bg-ivory/70 hover:border-coral hover:bg-coral/5 transition-all flex flex-col items-center justify-center gap-2 text-coral"
                  >
                    <ImagePlus size={24} />
                    <span className="text-xs font-bold">이미지 추가</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleAddPortfolioImages}
              />
              <p className="text-xs text-gray-400 mt-3 ml-1">최대 10장까지 등록할 수 있습니다.</p>
              {errors.portfolioImages && <p className="text-red-500 text-xs mt-2 ml-1">{errors.portfolioImages}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">정산 계좌</label>
              <div className="relative">
                <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
                  placeholder="은행명 / 계좌번호"
                  className="w-full pl-12 pr-6 py-4 bg-ivory border-2 border-transparent focus:border-coral rounded-2xl outline-none transition-all"
                />
              </div>
            </div>
          </section>

          <div className="pt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-coral text-white font-bold rounded-[32px] hover:bg-coral/90 transition-all shadow-xl shadow-coral/30 text-lg disabled:opacity-50"
            >
              {isSubmitting ? '신청 중...' : '프리랜서 등록 신청하기'}
            </button>
            <p className="text-center text-sm text-gray-400 mt-4">
              신청 시 프로필은 승인 대기 상태로 생성되며, 관리자 승인 후 프리랜서 권한이 활성화됩니다.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
