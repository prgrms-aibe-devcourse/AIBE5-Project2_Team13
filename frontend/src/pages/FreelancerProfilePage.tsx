import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Users, 
  MessageSquare, 
  Heart, 
  ChevronLeft,
  ChevronRight, 
  ExternalLink,
  Image as ImageIcon, 
  Briefcase, 
  LayoutGrid,
  X,
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
import { DEFAULT_PROFILE_IMAGE_URL } from '@/src/lib/profileImage';
import axios from 'axios';
import apiClient from '../api/axios';
import { getFreelancerProfileByFreelancerId, getMyFreelancerProfile, type FreelancerProfileDetailResponse } from '@/src/api/freelancerProfile';
import { useAuth } from '@/src/context/AuthContext';
import SafeImage from '../components/SafeImage';

type TabType = 'portfolio' | 'classes' | 'reviews';

export default function FreelancerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { toggleFollow, isFollowing: checkFollowing, followLoading } = useFollow();
  const { user } = useAuth(); // 본인 여부 판단용
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FreelancerProfileDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [myFreelancerId, setMyFreelancerId] = useState<number | null>(null);
  
  const [activeTab, setActiveTab] = useState<TabType>('portfolio');
  const [portfolioStartIndex, setPortfolioStartIndex] = useState(0);
  // 확대 모달은 "선택된 이미지 인덱스"를 기준으로 열고 닫아서 이전/다음 이동까지 함께 처리합니다.
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [selectedPortfolioImageIndex, setSelectedPortfolioImageIndex] = useState<number | null>(null);

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
        const detail = await getFreelancerProfileByFreelancerId(Number(id));
        if (isMounted) {
          setProfile(detail);
        }
      } catch (error) {
        if (!isMounted) return;
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setNotFound(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();
    return () => { isMounted = false; };
  }, [id]);

  // ✅ 프로필 로드 후 팔로워 수 API 조회
  useEffect(() => {
    if (!profile?.freelancerId) return;

    apiClient.get<{ count: number }>(`/follows/${profile.freelancerId}/count`)
      .then(res => setFollowerCount(res.data.count))
      .catch(() => setFollowerCount(0));
  }, [profile?.freelancerId]);

  useEffect(() => {
    // 포트폴리오 탭 전환 또는 다른 프리랜서로 이동하면 슬라이드 위치를 처음으로 되돌립니다.
    setPortfolioStartIndex(0);
  }, [profile?.freelancerId, activeTab]);

  useEffect(() => {
    if (user?.role !== 'FREELANCER') {
      setMyFreelancerId(null);
      return;
    }

    let isMounted = true;

    getMyFreelancerProfile()
      .then((myProfile) => {
        if (isMounted) {
          setMyFreelancerId(myProfile.freelancerId ?? null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMyFreelancerId(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.role]);

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
  const selectedPortfolioImage = selectedPortfolioImageIndex !== null
    ? portfolioImages[selectedPortfolioImageIndex] || null
    : null;

  // 본인 프로필 여부 — 이메일 기준 비교
  const isSelf = !!user && !!profile && user.email === profile.memberEmail;

  const handleFollow = async () => {
    if (!profile) return;

    // 본인 프로필이면 팔로우 불가 (UI에서 버튼 자체를 숨기지만 이중 방어)
    if (isSelf) return;

    const targetId = String(profile.freelancerId);
    const wasFollowing = checkFollowing(targetId);

    try {
      await toggleFollow(targetId);
      // 팔로우 토글 성공 후에만 팔로워 수 낙관적 업데이트
      setFollowerCount(prev => wasFollowing ? Math.max(0, prev - 1) : prev + 1);
    } catch {
      // 실패 시 count 변경 없음 (toggleFollow 내부에서 에러 로그 출력)
    }
  };

  // ─────────────────────────────────────
  // 포트폴리오 링크 외부 열기
  // ─────────────────────────────────────
  const handleOpenPortfolioLink = () => {
    if (!profile?.snsLink) return;
    window.open(profile.snsLink, '_blank', 'noopener,noreferrer');
  };

  const isOwnFreelancerProfile = myFreelancerId !== null && profile.freelancerId === myFreelancerId;

  const syncPortfolioViewport = (targetIndex: number) => {
    // 확대 모달에서 이미지를 넘겼을 때도, 본문 4장 목록 안에 같은 이미지가 보이도록 시작 인덱스를 맞춥니다.
    if (targetIndex < portfolioStartIndex) {
      setPortfolioStartIndex(targetIndex);
      return;
    }

    if (targetIndex >= portfolioStartIndex + 4) {
      setPortfolioStartIndex(targetIndex - 3);
    }
  };

  const handleOpenPortfolioImage = (imageIndex: number) => {
    // 본문 이미지 카드 클릭 시 해당 인덱스를 기억해서 확대 모달을 엽니다.
    setSelectedPortfolioImageIndex(imageIndex);
    syncPortfolioViewport(imageIndex);
  };

  const handleMoveSelectedPortfolioImage = (direction: 'prev' | 'next') => {
    if (selectedPortfolioImageIndex === null) {
      return;
    }

    const nextIndex = direction === 'prev'
      ? selectedPortfolioImageIndex - 1
      : selectedPortfolioImageIndex + 1;

    if (nextIndex < 0 || nextIndex >= portfolioImages.length) {
      return;
    }

    // 모달 안에서 좌우 이동할 때 본문 캐러셀 위치도 함께 동기화합니다.
    setSelectedPortfolioImageIndex(nextIndex);
    syncPortfolioViewport(nextIndex);
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
               <SafeImage src={profile.memberImageUrl || DEFAULT_PROFILE_IMAGE_URL}
                                            alt={profile.memberName}
                                            className="w-full h-full object-cover" />
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
                    <span>팔로워 {followerCount}명</span>
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
                {/* 본인 프로필이면 팔로우 버튼 숨김 */}
                {!isSelf && (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={cn(
                      "flex-1 md:flex-none px-12 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60",
                      checkFollowing(String(profile.freelancerId))
                        ? "bg-ivory text-coral border-2 border-coral shadow-coral/10"
                        : "bg-coral text-white hover:bg-coral/90 shadow-coral/20"
                    )}
                  >
                    <Heart
                      size={20}
                      className={cn(
                        "transition-all",
                        checkFollowing(String(profile.freelancerId)) && "fill-coral"
                      )}
                    />
                    {checkFollowing(String(profile.freelancerId)) ? '팔로잉' : '팔로우'}
                  </button>
                )}
                <button
                  // 프리랜서 프로필 상세 문의도 대상 freelancer 회원 PK로 실제 1:1 채팅방을 엽니다.
                  onClick={() => navigate(`/chat?targetMemberId=${profile.freelancerId}`)}
                  disabled={isOwnFreelancerProfile}
                  className="flex-1 md:flex-none px-12 py-4 bg-white border-2 border-coral/20 text-coral font-bold rounded-2xl hover:bg-ivory transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
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

                <div className="flex justify-start">
                  <button
                    onClick={handleOpenPortfolioLink}
                    disabled={!profile.snsLink}
                    className="px-8 py-4 bg-white border-2 border-coral/20 text-coral font-bold rounded-2xl hover:bg-ivory transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ExternalLink size={20} />
                    포트폴리오 링크
                  </button>
                </div>

                {portfolioImages.length > 0 ? (
                  <div className="relative">
                    {/* 본문 캐러셀은 한 번에 4장만 보여주고, 현재 양끝 상태에 따라 버튼을 숨깁니다. */}
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
                          // 클릭 시 확대 모달이 열리고, 현재 보고 있는 이미지 인덱스가 저장됩니다.
                          className="aspect-square rounded-[32px] overflow-hidden border border-coral/10 shadow-sm group relative cursor-zoom-in"
                          onClick={() => handleOpenPortfolioImage(portfolioStartIndex + idx)}
                        >
                          <SafeImage src={img} alt={`Portfolio ${portfolioStartIndex + idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold">확대 보기</span>
                          </div>
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

      <AnimatePresence>
        {selectedPortfolioImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // 확대 모달은 배경 클릭으로도 닫히고, 내부 버튼/이미지 클릭은 전파를 막습니다.
            className="fixed inset-0 z-50 bg-black/75 px-4 py-8 flex items-center justify-center"
            onClick={() => setSelectedPortfolioImageIndex(null)}
          >
            <button
              type="button"
              onClick={() => setSelectedPortfolioImageIndex(null)}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-colors"
            >
              <X size={22} />
            </button>
            {selectedPortfolioImageIndex !== null && selectedPortfolioImageIndex > 0 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  // 첫 이미지가 아닐 때만 이전 버튼을 노출합니다.
                  handleMoveSelectedPortfolioImage('prev');
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {selectedPortfolioImageIndex !== null && selectedPortfolioImageIndex < portfolioImages.length - 1 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  // 마지막 이미지가 아닐 때만 다음 버튼을 노출합니다.
                  handleMoveSelectedPortfolioImage('next');
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            )}
            <motion.img
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              src={selectedPortfolioImage}
              alt="선택한 포트폴리오 이미지"
              className="max-w-full max-h-full rounded-[28px] shadow-2xl object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
