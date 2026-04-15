import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

interface FollowContextType {
  followingIds: string[];
  toggleFollow: (freelancerId: string) => Promise<void>;
  isFollowing: (freelancerId: string) => boolean;
  isLoading: boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export const FollowProvider = ({ children }: { children: ReactNode }) => {
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFollow = async (freelancerId: string) => {
    try {
      setIsLoading(true);

      const res = await axios.post('/api/follow/toggle', {
        freelancerId,
      });

      // backend에서 최신 리스트 반환한다고 가정
      setFollowingIds(res.data.followingIds);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFollowing = (freelancerId: string) => {
    return followingIds.includes(freelancerId);
  };

  return (
    <FollowContext.Provider value={{ followingIds, toggleFollow, isFollowing, isLoading }}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = () => {
  const context = useContext(FollowContext);
  if (!context) throw new Error('useFollow must be used within FollowProvider');
  return context;
};