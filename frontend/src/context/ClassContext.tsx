import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import apiClient from '../api/axios';
import { ClassItem } from '../constants';
import { getAccessToken } from '../lib/auth';

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
    rating?: number;
    reviews?: number;
    images?: Array<{
        fileUrl?: string | null;
    }>;
    attachments?: Array<{
        fileUrl?: string | null;
    }>;
    createdAt?: string;
    updatedAt?: string;
}

// API 응답 데이터의 images 또는 attachments 필드에서 유효한 이미지 URL 목록을 추출하여 반환합니다.
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

// API 응답 객체를 ClassItem 형식으로 변환하며, 온라인 여부와 우선순위가 적용된 대표 이미지 URL을 결정합니다.
function toClassItem(api: ClassApiResponse): ClassItem {
    const isOnline = api.isOnline ?? (api as { online?: boolean }).online ?? false;
    const imageUrls = getImageUrls(api);
    const representativeImage =
        api.representativeImageUrl || imageUrls[0] || '/pogeun.png';

    return {
        id: String(api.id),
        title: api.title,
        freelancer: api.freelancerName,
        freelancerEmail: api.freelancerEmail,
        freelancerId: String(api.freelancerId),
        price: api.price,
        category: api.categoryName,
        image: representativeImage,
        rating: api.rating ?? 0,
        reviews: api.reviews ?? 0,
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

export const ClassProvider = ({ children }: { children: ReactNode }) => {
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

    // apiClient를 통해 클래스 목록 데이터를 조회하고, toClassItem으로 변환하여 상태를 업데이트하며, 오류 발생 시 콘솔에 기록합니다.
    const fetchClasses = useCallback(async () => {
        try {
            const response = await apiClient.get<ClassApiResponse[]>('/classes');
            setClasses(response.data.map(toClassItem));
        } catch (err) {
            console.error('클래스 목록 조회 실패:', err);
        }
    }, []);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    // FormData를 통해 새 클래스 생성 요청을 보내고, 성공 시 클래스 목록을 갱신하며 실패 시 에러를 처리합니다.
    const addClass = async (newClass: CreateClassPayload) => {
        try {
            const formData = new FormData();

            // 텍스트/숫자 필드 추가
            formData.append('title',       newClass.title);
            formData.append('description', newClass.description || '');
            formData.append('categoryId',  String(newClass.categoryId));
            formData.append('price',       String(newClass.price));
            formData.append('isOnline',    String(newClass.isOnline));
            formData.append('startAt',     newClass.startAt);
            formData.append('endAt',       newClass.endAt);
            formData.append('maxCapacity', String(newClass.maxCapacity));
            if (newClass.curriculum) formData.append('curriculum', newClass.curriculum);
            if (newClass.location)   formData.append('location',   newClass.location);

            // 이미지 파일 추가
            if (newClass.images?.length) {
                newClass.images.forEach(file => formData.append('images', file));
            }

            // apiClient 사용 — sessionStorage + localStorage 둘 다 확인하는 인터셉터 적용
            await apiClient.post('/classes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
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
            setClasses((prev) => prev.filter((currentClass) => currentClass.id !== id));
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
            updatedClass.deletedImageIds.forEach((imageId) => formData.append('deletedImageIds', String(imageId)));
        }

        if (updatedClass.images?.length) {
            updatedClass.images.forEach((file) => formData.append('images', file));
        }

        await apiClient.put(`/classes/${id}`, formData, getAuthConfig());
        await fetchClasses();
    };

    // 클래스의 모집 상태를 반전(토글)시키는 기능 (API 호출 후 로컬 상태 반영)
    const toggleStatus = async (id: string) => {
        setClasses((prev) =>
            prev.map((currentClass) =>
                currentClass.id === id
                    ? { ...currentClass, status: currentClass.status === 'CLOSE' ? 'OPEN' : 'CLOSE' }
                    : currentClass
            )
        );

        try {
            const response = await apiClient.patch<string>(`/classes/${id}/status`, undefined, getAuthConfig());
            const nextStatus = response.data;

            setClasses((prev) =>
                prev.map((currentClass) => (currentClass.id === id ? { ...currentClass, status: nextStatus } : currentClass))
            );
        } catch (error) {
            console.error('클래스 상태 변경 실패:', error);
            await fetchClasses();
            throw error;
        }
    };

    return (
        <ClassContext.Provider value={{ classes, fetchClasses, addClass, deleteClass, updateClass, toggleStatus }}>
            {children}
        </ClassContext.Provider>
    );
};

// ClassContext를 안전하게 사용하기 위한 커스텀 훅으로, Provider 외부에서 호출될 경우 에러를 발생시킵니다.
export const useClasses = () => {
    const context = useContext(ClassContext);

    if (context === undefined) {
        throw new Error('useClasses must be used within a ClassProvider');
    }

    return context;
};
