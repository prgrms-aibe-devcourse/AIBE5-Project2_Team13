import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Users, 
  MessageSquare, 
  Heart, 
  Edit2, 
  ChevronRight, 
  Image as ImageIcon, 
  Briefcase, 
  LayoutGrid,
  X,
  Plus,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { 
  MOCK_FREELANCER_PROFILES, 
  MOCK_CLASSES, 
  MOCK_REVIEWS, 
  FreelancerProfile,
  ClassItem,
  ReviewItem,
  REGIONS,
  CATEGORIES
} from '@/src/constants';
import ExplorerItemCard from '@/src/components/ExplorerItemCard';
import { useFreelancers } from '../context/FreelancerContext';
import { useFollow } from '../context/FollowContext';

type TabType = 'portfolio' | 'classes' | 'reviews';

export default function FreelancerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { freelancers } = useFreelancers();
  const { toggleFollow, isFollowing: checkFollowing } = useFollow();
  
  // Get profile from context
  const profile = freelancers.find(p => p.id === id) || freelancers[0];
  
  const [activeTab, setActiveTab] = useState<TabType>('portfolio');
  
  // Check if it's the user's own profile
  const currentUserRole = localStorage.getItem('userRole');
  const isOwnProfile = profile?.id === 'f1' && currentUserRole === 'ROLE_FREELANCER';

  if (!profile) return <div className="p-20 text-center">프로필을 찾을 수 없습니다.</div>;

  const freelancerClasses = MOCK_CLASSES.filter(c => c.freelancer === profile.name);
  const freelancerReviews = MOCK_REVIEWS; // In real app, filter by freelancer

  const handleFollow = () => {
    if (profile) {
      toggleFollow(profile.id);
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
                  src={profile.avatar} 
                  alt={profile.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              {isOwnProfile && (
                <button 
                  onClick={() => navigate('/mypage/profile-edit')}
                  className="absolute bottom-4 right-4 p-4 bg-coral text-white rounded-2xl shadow-lg hover:scale-110 transition-transform"
                >
                  <Edit2 size={20} />
                </button>
              )}
            </motion.div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <h1 className="text-4xl font-bold text-gray-900">{profile.name}</h1>
                  <span className="px-4 py-1.5 bg-coral/10 text-coral text-sm font-bold rounded-full">
                    {profile.specialty}
                  </span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500 font-medium">
                  <div className="flex items-center gap-1">
                    <MapPin size={18} className="text-coral" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={18} className="text-coral" />
                    <span>팔로워 {profile.followerCount}</span>
                  </div>
                </div>
              </div>

              <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                {profile.introduction}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 py-4">
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-400 font-bold mb-1 uppercase tracking-wider">평균 평점</p>
                  <div className="flex items-center gap-2">
                    <Star className="text-yellow-400 fill-yellow-400" size={24} />
                    <span className="text-3xl font-bold text-gray-900">{profile.rating}</span>
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-400 font-bold mb-1 uppercase tracking-wider">총 리뷰</p>
                  <p className="text-3xl font-bold text-gray-900">{profile.reviewCount}개</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center md:justify-start pt-4">
                {!isOwnProfile && (
                  <button 
                    onClick={handleFollow}
                    className={cn(
                      "flex-1 md:flex-none px-12 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg",
                      checkFollowing(profile.id) 
                        ? "bg-ivory text-coral border-2 border-coral shadow-coral/10" 
                        : "bg-coral text-white hover:bg-coral/90 shadow-coral/20"
                    )}
                  >
                    <Heart size={20} className={cn(checkFollowing(profile.id) && "fill-coral")} />
                    {checkFollowing(profile.id) ? '팔로잉' : '팔로우'}
                  </button>
                )}
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
                    {profile.career}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {profile.portfolioImages.map((img, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ y: -10 }}
                      className="aspect-square rounded-[32px] overflow-hidden border border-coral/10 shadow-sm group relative"
                    >
                      <img src={img} alt={`Portfolio ${idx}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-bold">자세히 보기</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
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
