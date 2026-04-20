import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useFollow } from '../context/FollowContext';
import apiClient from '../api/axios';
import SafeImage from './SafeImage';
import { DEFAULT_PROFILE_IMAGE_URL } from '../lib/profileImage';

/**
 * 마이페이지 > 팔로잉 화면
 *
 * GET /api/follows/detail → 내가 팔로우한 프리랜서 상세 목록 조회
 * 카드 클릭 → /freelancer/{freelancerId} 상세 프로필 이동
 * 팔로잉 취소 버튼 → toggleFollow() 호출 후 목록에서 제거
 */

interface FollowingItem {
  memberId: number;
  freelancerId: number;
  name: string;
  imageUrl: string | null;
  specialtyCategoryName: string | null;
  followerCount: number;
}

export default function FollowingList() {
  const navigate = useNavigate();
  const { toggleFollow, followLoading } = useFollow();

  const [list,    setList]    = useState<FollowingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 마운트 시 팔로잉 상세 목록 조회
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<FollowingItem[]>('/follows/detail');
        setList(res.data);
      } catch {
        setList([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 팔로잉 취소 — API 호출 후 목록에서 즉시 제거
  const handleUnfollow = async (memberId: number) => {
    await toggleFollow(String(memberId));
    setList(prev => prev.filter(item => item.memberId !== memberId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-400">
        목록을 불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">팔로잉 프리랜서</h2>
        <span className="text-sm text-gray-400">총 {list.length}명</span>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[32px] border border-coral/10 shadow-sm">
          <div className="text-gray-300 mb-4">
            <Heart size={48} className="mx-auto" />
          </div>
          <p className="text-gray-400 font-medium mb-2">팔로잉 중인 프리랜서가 없어요.</p>
          <button
            onClick={() => navigate('/browse')}
            className="mt-4 px-6 py-3 bg-coral text-white font-bold rounded-2xl hover:bg-coral/90 transition-all"
          >
            전문가 찾아보기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map(item => (
            <motion.div
              key={item.memberId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-coral/20 transition-all flex items-center gap-4"
            >
              {/* 프로필 이미지 — 클릭 시 상세 이동 */}
              <div
                className="cursor-pointer shrink-0"
                onClick={() => navigate(`/freelancer/${item.freelancerId}`)}
              >
                <SafeImage
                  src={item.imageUrl || DEFAULT_PROFILE_IMAGE_URL}
                  alt={item.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-coral/10"
                />
              </div>

              {/* 프리랜서 정보 — 클릭 시 상세 이동 */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate(`/freelancer/${item.freelancerId}`)}
              >
                <h4 className="font-bold text-gray-900 hover:text-coral transition-colors truncate">
                  {item.name}
                </h4>
                {item.specialtyCategoryName && (
                  <span className="text-xs font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-lg inline-block mt-1">
                    {item.specialtyCategoryName}
                  </span>
                )}
                <div className="flex items-center gap-1 mt-1.5">
                  <Users size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-400">
                    팔로워 {item.followerCount.toLocaleString()}명
                  </span>
                </div>
              </div>

              {/* 팔로잉 취소 버튼 */}
              <button
                onClick={() => handleUnfollow(item.memberId)}
                disabled={followLoading}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-coral/10 text-coral font-bold rounded-xl hover:bg-red-50 hover:text-red-400 transition-all text-xs disabled:opacity-60"
              >
                <Heart size={13} className="fill-coral" />
                팔로잉 중
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
