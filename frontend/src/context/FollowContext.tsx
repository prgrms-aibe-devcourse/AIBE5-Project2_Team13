import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface FollowData {
  userId: string;
  freelancerId: string;
  followedAt: Timestamp;
}

interface FollowContextType {
  followingIds: string[];
  toggleFollow: (freelancerId: string) => Promise<void>;
  isFollowing: (freelancerId: string) => boolean;
  isLoading: boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export const FollowProvider = ({ children }: { children: ReactNode }) => {
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setFollowingIds([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    setIsLoading(true);
    const q = query(collection(db, 'follows'), where('userId', '==', userId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ids = snapshot.docs.map(doc => doc.data().freelancerId);
      setFollowingIds(ids);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching follows:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const toggleFollow = async (freelancerId: string) => {
    if (!userId) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }

    const followDocId = `${userId}_${freelancerId}`;
    const followRef = doc(db, 'follows', followDocId);

    try {
      if (followingIds.includes(freelancerId)) {
        // Unfollow
        await deleteDoc(followRef);
      } else {
        // Follow
        await setDoc(followRef, {
          userId,
          freelancerId,
          followedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      alert('팔로우 처리 중 오류가 발생했습니다.');
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
  if (context === undefined) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
};
