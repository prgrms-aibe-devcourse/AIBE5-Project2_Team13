import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Users, 
  MessageSquare, 
  Heart, 
  ChevronLeft,
  ChevronRight, 
  Image as ImageIcon, 
  Briefcase, 
  LayoutGrid,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { 
  MOCK_CLASSES, 
  MOCK_REVIEWS, 
  CATEGORIES
} from '@/src/constants';
import ExplorerItemCard from '@/src/components/ExplorerItemCard';
import { useFollow } from '../context/FollowContext';
import { getFreelancerProfileByFreelancerId, type FreelancerProfileDetailResponse } from '@/src/api/freelancerProfile';
import { DEFAULT_PROFILE_IMAGE_URL } from '@/src/lib/profileImage';
import axios from 'axios';

type TabType = 'portfolio' | 'classes' | 'reviews';

export default function FreelancerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { toggleFollow, isFollowing: checkFollowing } = useFollow();
  const [profile, setProfile] = useState<FreelancerProfileDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const [activeTab, setActiveTab] = useState<TabType>('portfolio');
  const [portfolioStartIndex, setPortfolioStartIndex] = useState(0);

  useEffect(() => {
    if (!id || Number.isNaN(Number(id))) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        // /freelancer/:id 는 이제 profileId가 아니라 freelancerId 기준 공개 API를 조회합니다.
        const detail = await getFreelancerProfileByFreelancerId(Number(id));
        if (isMounted) {
          setProfile(detail);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setNotFound(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    // 포트폴리오 탭 전환 또는 다른 프리랜서로 이동하면 슬라이드 위치를 처음으로 되돌립니다.
    setPortfolioStartIndex(0);
  }, [profile?.freelancerId, activeTab]);

  if (loading) {
    return <div className="p-20 text-center text-gray-500">프리랜서 프로필을 불러오는 중입니다.</div>;
  }

  if (notFound || !profile) {
    return <div className="p-20 text-center">프로필을 찾을 수 없습니다.</div>;
  }

  const freelancerClasses = MOCK_CLASSES.filter(c => c.freelancerId === String(profile.freelancerId) || c.freelancer === profile.memberName);
  const freelancerReviews = MOCK_REVIEWS;
  // 공개 응답의 첨부 목록을 캐러셀용 이미지 URL 배열로 평탄화합니다.
  const portfolioImages = profile.attachments.map((attachment) => attachment.fileUrl);
  const visiblePortfolioImages = portfolioImages.slice(portfolioStartIndex, portfolioStartIndex + 4);
  const canMovePortfolioLeft = portfolioImages.length > 4 && portfolioStartIndex > 0;
  const canMovePortfolioRight = portfolioImages.length > 4 && portfolioStartIndex + 4 < portfolioImages.length;

  const handleFollow = () => {
    if (profile) {
      // 팔로잉 기준도 이제 목업 id가 아니라 실제 freelancerId 문자열을 사용합니다.
      toggleFollow(String(profile.freelancerId));
    }
  };

  return (
    <div className="min-h-screen bg-ivory pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b border-coral/10 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
            {/* Profile Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-48 h-48 md:w-64 md:h-64 shrink-0"
            >
              <div className="w-full h-full rounded-[48px] overflow-hidden border-4 border-ivory shadow-xl">
                <img 
                  src={profile.memberImageUrl || DEFAULT_PROFILE_IMAGE_URL} 
                  alt={profile.memberName} 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <h1 className="text-4xl font-bold text-gray-900">{profile.memberName}</h1>
                  <span className="px-4 py-1.5 bg-coral/10 text-coral text-sm font-bold rounded-full">
                    {profile.specialtyCategoryName || '전문 분야 미정'}
                  </span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500 font-medium">
                  <div className="flex items-center gap-1">
                    <MapPin size={18} className="text-coral" />
                    <span>{profile.memberAddress || '활동 지역 미설정'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={18} className="text-coral" />
                    <span>팔로워 0</span>
                  </div>
                </div>
              </div>

              <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                {profile.bio || '등록된 소개가 없습니다.'}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 py-4">
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-400 font-bold mb-1 uppercase tracking-wider">평균 평점</p>
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={24} />
                    <span className="text-3xl font-bold text-gray-900">0</span>
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-400 font-bold mb-1 uppercase tracking-wider">총 리뷰</p>
                  <p className="text-3xl font-bold text-gray-900">{freelancerReviews.length}개</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center md:justify-start pt-4">
                <button 
                  onClick={handleFollow}
                  className={cn(
                    "flex-1 md:flex-none px-12 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg",
                    checkFollowing(String(profile.freelancerId)) 
                      ? "bg-ivory text-coral border-2 border-coral shadow-coral/10" 
                      : "bg-coral text-white hover:bg-coral/90 shadow-coral/20"
                  )}
                >
                  <Heart size={20} className={cn(checkFollowing(String(profile.freelancerId)) && "fill-coral")} />
                  {checkFollowing(String(profile.freelancerId)) ? '팔로잉' : '팔로우'}
                </button>
                <button className="flex-1 md:flex-none px-12 py-4 bg-white border-2 border-coral/20 text-coral font-bold rounded-2xl hover:bg-ivory transition-all flex items-center justify-center gap-2">
                  <MessageSquare size={20} />
                  1:1 문의
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex border-b border-coral/10 mb-12">
          {[
            { id: 'portfolio', label: '포트폴리오', icon: ImageIcon },
            { id: 'classes', label: '진행 중인 클래스', icon: LayoutGrid },
            { id: 'reviews', label: '리뷰', icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2 px-8 py-4 font-bold transition-all relative",
                activeTab === tab.id ? "text-coral" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-coral rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'portfolio' && (
              <div className="space-y-12">
                <div className="bg-white rounded-[40px] p-10 border border-coral/10 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Briefcase className="text-coral" size={24} />
                    경력 및 이력
                  </h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                    {profile.career || '등록된 경력이 없습니다.'}
                  </p>
                </div>

                {portfolioImages.length > 0 ? (
                  <div className="relative">
                    {canMovePortfolioLeft && (
                      <button
                        type="button"
                        onClick={() => setPortfolioStartIndex((prev) => Math.max(0, prev - 1))}
                        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-coral/15 shadow-lg text-coral flex items-center justify-center hover:bg-coral hover:text-white transition-all"
                      >
                        <ChevronLeft size={22} />
                      </button>
                    )}

                    {canMovePortfolioRight && (
                      <button
                        type="button"
                        onClick={() => setPortfolioStartIndex((prev) => Math.min(prev + 1, Math.max(0, portfolioImages.length - 4)))}
                        className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-coral/15 shadow-lg text-coral flex items-center justify-center hover:bg-coral hover:text-white transition-all"
                      >
                        <ChevronRight size={22} />
                      </button>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {visiblePortfolioImages.map((img, idx) => (
                        <motion.div 
                          key={`${img}-${portfolioStartIndex + idx}`}
                          whileHover={{ y: -10 }}
                          className="aspect-square rounded-[32px] overflow-hidden border border-coral/10 shadow-sm group relative"
                        >
                          <img src={img} alt={`Portfolio ${portfolioStartIndex + idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[32px] bg-white border border-coral/10 px-8 py-16 text-center text-gray-400 font-medium">
                    등록된 포트폴리오 이미지가 없습니다.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'classes' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {freelancerClasses.map(cls => (
                  <ExplorerItemCard 
                    key={cls.id} 
                    {...cls} 
                    id={cls.id}
                    image={cls.image}
                    title={cls.title}
                    value={cls.price}
                    valueLabel="수강료"
                    personName={cls.freelancer}
                    personLabel="프리랜서"
                    personId={cls.freelancerId}
                    categoryName={CATEGORIES.find(cat => cat.id === cls.category)?.name || '기타'}
                  />
                ))}
                {freelancerClasses.length === 0 && (
                  <div className="col-span-full py-20 text-center text-gray-400 font-medium">
                    현재 모집 중인 클래스가 없습니다.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {freelancerReviews.map(review => (
                  <div key={review.id} className="bg-white rounded-[32px] p-8 border border-coral/10 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{review.author}</span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={cn(i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200")} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">{review.date} · {review.className}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.content}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
