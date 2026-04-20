import apiClient from './axios';
import { EnrollmentItem, EnrollmentStatus } from '@/src/constants';

interface ApplyClassOrderRequest {
  classBoardId: number;
}

export async function applyClassOrder(request: ApplyClassOrderRequest): Promise<number> {
  const response = await apiClient.post<number>('/class-orders', request);
  return response.data;
}

interface ClassOrderSummaryResponse {
  orderId: number;
  classId: number;
  classTitle: string;
  price: number;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  studentName: string;
  studentEmail: string;
}

export async function getMyClassOrders(): Promise<EnrollmentItem[]> {
  const response = await apiClient.get<ClassOrderSummaryResponse[]>('/class-orders/me');
  return response.data.map((order) => {
    const mappedStatus: EnrollmentStatus =
      order.approvalStatus === 'APPROVED'
        ? 'APPROVED'
        : order.approvalStatus === 'REJECTED'
          ? 'CANCELLED'
          : 'PENDING';

    return {
      id: String(order.orderId),
      classId: String(order.classId),
      classTitle: order.classTitle,
      studentName: order.studentName,
      studentEmail: order.studentEmail,
      status: mappedStatus,
      appliedAt: order.appliedAt?.split('T')[0] ?? '',
      price: order.price ?? 0,
    };
  });
}
