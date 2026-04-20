import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import axios from 'axios';
import apiClient from '../api/axios';
import {ClassItem} from '../constants';
import {getAccessToken} from '../lib/auth';

interface CreateClassPayload {
    title: string;
    description: string;
    categoryId: number;
    price: number;
    isOnline: boolean;
    startAt: string;
    endAt: string;
    maxCapacity: number;
    curriculum?: string;
    location?: string;
    images?: File[];
    deletedImageIds?: number[];
}

interface ClassContextType {
    classes: ClassItem[];
    fetchClasses: () => Promise<void>;
    addClass: (newClass: CreateClassPayload) => Promise<void>;
    deleteClass: (id: string) => Promise<void>;
    updateClass: (id: string, updatedClass: CreateClassPayload) => Promise<void>;
    toggleStatus: (id: string) => Promise<void>;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

interface ClassApiResponse {
    id: number;
    title: string;
    description?: string;
    categoryName: string;
    freelancerName: string;
    freelancerEmail: string;
    freelancerId: number;
    price: number;
    isOnline: boolean;
    startAt?: string;
    endAt?: string;
    maxCapacity?: number;
    status?: string;
    curriculum?: string;
    location?: string;
    representativeImageUrl?: string;
    images?: Array<{
        fileUrl?: string | null;
    }>;
    attachments?: Array<{
        fileUrl?: string | null;
    }>;
    createdAt?: string;
    updatedAt?: string;
}

//DB의 이미지 url을 가져옵니다
const getImageUrls = (api: ClassApiResponse): string[] => {
    const candidates = Array.isArray(api.images)
        ? api.images
        : Array.isArray(api.attachments)
            ? api.attachments
            : [];
    return candidates
        .map((image) => image?.fileUrl)
        .filter((fileUrl): fileUrl is string => !!fileUrl);
};

function toClassItem(api: ClassApiResponse): ClassItem {
    const isOnline = api.isOnline ?? (api as any).online ?? false;
    const imageUrls = getImageUrls(api);
    const representativeImage = api.representativeImageUrl || imageUrls[0] || `https://picsum.photos/seed/class${api.id}/400/300`;

    return {
        id: String(api.id),
        title: api.title,
        freelancer: api.freelancerName,
        freelancerEmail: api.freelancerEmail,
        freelancerId: String(api.freelancerId),
        price: api.price,
        category: api.categoryName,
        image: representativeImage,
        rating: 0,
        reviews: 0,
        isOffline: !isOnline,
        location: !isOnline ? api.location ?? '오프라인 장소' : undefined,
        status: api.status,
        startAt: api.startAt,
        endAt: api.endAt,
        maxCapacity: api.maxCapacity,
        curriculum: api.curriculum,
        description: api.description,
        createdAt: api.createdAt ?? new Date().toISOString(),
        updatedAt: api.updatedAt,
    };
}

export const ClassProvider = ({children}: { children: ReactNode }) => {
    const [classes, setClasses] = useState<ClassItem[]>([]);

    const getAuthConfig = () => {
        const token = getAccessToken();

        return token
            ? {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
            : undefined;
    };

    const fetchClasses = async () => {
        try {
            const response = await apiClient.get<ClassApiResponse[]>('/classes');
            const classList = response.data;

            const detailResponses = await Promise.allSettled(
                classList.map(async (item) => {
                    const detail = await apiClient.get<ClassApiResponse>(`/classes/${item.id}`);
                    return detail.data;
                })
            );

            const detailMap = new Map<number, ClassApiResponse>();
            detailResponses.forEach((result) => {
                if (result.status === 'fulfilled') {
                    detailMap.set(result.value.id, result.value);
                }
            });

            const merged = classList.map((item) => {
                const detail = detailMap.get(item.id);
                if (!detail) {
                    return item;
                }

                return {
                    ...item,
                    representativeImageUrl: detail.representativeImageUrl,
                    images: detail.images,
                };
            });

            setClasses(merged.map(toClassItem));
        } catch (err) {
            console.error('클래스 목록 조회 실패:', err);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const addClass = async (newClass: CreateClassPayload) => {
        try {
            const token = getAccessToken();
            const formData = new FormData();
            formData.append('title', newClass.title);
            formData.append('description', newClass.description || '');
            formData.append('categoryId', String(newClass.categoryId));
            formData.append('price', String(newClass.price));
            formData.append('isOnline', String(newClass.isOnline));
            formData.append('startAt', newClass.startAt);
            formData.append('endAt', newClass.endAt);
            formData.append('maxCapacity', String(newClass.maxCapacity));
            if (newClass.curriculum) {
                formData.append('curriculum', newClass.curriculum);
            }
            if (newClass.location) {
                formData.append('location', newClass.location);
            }
            if (newClass.images && newClass.images.length > 0) {
                newClass.images.forEach((file) => {
                    formData.append('images', file);
                });
            }

            console.log('[ClassContext] createClass token exists:', !!token);
            console.log('[ClassContext] createClass token preview:', token ? token.slice(0, 20) : null);

            await axios.post('/api/classes', formData, {
                headers: token
                    ? {
                        Authorization: `Bearer ${token}`,
                    }
                    : undefined,
            });
            await fetchClasses();
        } catch (error) {
            console.error('클래스 생성 실패:', error);
            throw error;
        }
    };

    // 클래스를 삭제하는 기능 (API 호출 후 로컬 상태 반영)
    const deleteClass = async (id: string) => {
        try {
            await apiClient.delete(`/classes/${id}`, getAuthConfig());
            setClasses(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error('클래스 삭제 실패:', error);
            throw error;
        }
    };

    // 클래스 정보를 수정하는 기능 (API 호출 후 목록 새로고침)
    const updateClass = async (id: string, updatedClass: CreateClassPayload) => {
        const formData = new FormData();

        // 1. 단순 텍스트/숫자 필드 정의
        const simpleFields = {
            title: updatedClass.title,
            description: updatedClass.description || '',
            categoryId: String(updatedClass.categoryId),
            price: String(updatedClass.price),
            isOnline: String(updatedClass.isOnline),
            startAt: updatedClass.startAt,
            endAt: updatedClass.endAt,
            maxCapacity: String(updatedClass.maxCapacity),
            curriculum: updatedClass.curriculum,
            location: updatedClass.location,
        };

        // 2. 반복문으로 깔끔하게 append
        Object.entries(simpleFields).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });

        // 3. 특별 처리 필드 (파일이나 배열 등)는 아래에 따로 관리
        if (updatedClass.deletedImageIds?.length) {
            updatedClass.deletedImageIds.forEach((id) => formData.append('deletedImageIds', String(id)));
        }

        if (updatedClass.images?.length) {
            updatedClass.images.forEach((file) => formData.append('images', file));
        }

        await apiClient.put(`/classes/${id}`, formData, getAuthConfig());
        await fetchClasses();
    };

    // 클래스의 모집 상태를 반전(토글)시키는 기능 (API 호출 후 로컬 상태 반영)
    const toggleStatus = async (id: string) => {
        // 1. [즉시 반영] 서버 응답 기다리지 않고 상태를 먼저 바꿔버립니다
        // 마이페이지 모집완료 배지 업데이트되는 속도 향상을 위해 추가
        setClasses(prev => prev.map(c =>
            c.id === id ? {...c, status: c.status === 'CLOSE' ? 'OPEN' : 'CLOSE'} : c
        ));

        try {
            // 2. [서버 통신] 그 다음 서버에 요청을 보냅니다.
            const response = await apiClient.patch<string>(`/classes/${id}/status`, undefined, getAuthConfig());

            // 3. 만약 서버에서 응답받은 값이랑 내 로컬 상태랑 다를 수 있다면,
            // 여기서 한 번 더 확실하게 동기화해줍니다.
            const nextStatus = response.data;
            setClasses(prev => prev.map(c => c.id === id ? {...c, status: nextStatus} : c));

        } catch (error) {
            console.error('클래스 상태 변경 실패:', error);

            // 서버 통신 실패 시, 다시 전체 데이터를 불러와서 강제 원상복구합니다.
            await fetchClasses();
            throw error;
        }
    };

    return (
        <ClassContext.Provider value={{classes, fetchClasses, addClass, deleteClass, updateClass, toggleStatus}}>
            {children}
        </ClassContext.Provider>
    );
};

export const useClasses = () => {
    const context = useContext(ClassContext);
    if (context === undefined) {
        throw new Error('useClasses must be used within a ClassProvider');
    }
    return context;
};
