import apiClient from './axios';
import { ReviewItem } from '@/src/constants';

interface ReviewResponse {
  id: number;
  orderId: number;
  classId: number;
  className: string;
  author: string;
  userId: number;
  rating: number;
  content: string;
  createdAt: string | null;
}

interface ReviewRequest {
  rating: number;
  content: string;
}

function mapReview(response: ReviewResponse): ReviewItem {
  return {
    id: String(response.id),
    orderId: String(response.orderId),
    author: response.author,
    userId: String(response.userId),
    rating: response.rating,
    content: response.content,
    date: response.createdAt ?? '',
    className: response.className,
    classId: String(response.classId),
  };
}

export async function getMyReviews(): Promise<ReviewItem[]> {
  const response = await apiClient.get<ReviewResponse[]>('/reviews/me');
  return response.data.map(mapReview);
}

export async function getClassReviews(classId: string): Promise<ReviewItem[]> {
  const response = await apiClient.get<ReviewResponse[]>(`/reviews/classes/${classId}`);
  return response.data.map(mapReview);
}

export async function createReview(orderId: string, request: ReviewRequest): Promise<ReviewItem> {
  const response = await apiClient.post<ReviewResponse>(`/reviews/orders/${orderId}`, request);
  return mapReview(response.data);
}

export async function updateReview(reviewId: string, request: ReviewRequest): Promise<ReviewItem> {
  const response = await apiClient.put<ReviewResponse>(`/reviews/${reviewId}`, request);
  return mapReview(response.data);
}

export async function deleteReview(reviewId: string): Promise<void> {
  await apiClient.delete(`/reviews/${reviewId}`);
}
