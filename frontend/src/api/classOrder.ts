import apiClient from './axios';
import { EnrollmentItem, EnrollmentStatus } from '@/src/constants';

interface ApplyClassOrderRequest {
  classBoardId: number;
}

interface ClassOrderSummaryResponse {
  orderId: number;
  classId: number;
  classTitle: string;
  price: number;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  progressStatus: 'BEFORE_START' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  appliedAt: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
}

export type FreelancerDashboardTrendItem = {
  month: string;
  revenue: number;
  students: number;
};

export type FreelancerDashboardResponse = {
  expectedRevenueThisMonth: number;
  revenueChangeRate: number;
  totalStudents: number;
  studentsAddedThisMonth: number;
  averageRating: number;
  reviewCount: number;
  totalRevenue: number;
  trend: FreelancerDashboardTrendItem[];
};

function mapClassOrderToEnrollment(order: ClassOrderSummaryResponse): EnrollmentItem {
  let mappedStatus: EnrollmentStatus = 'PENDING';

  if (order.approvalStatus === 'APPROVED') {
    mappedStatus = 'APPROVED';
  } else if (order.approvalStatus === 'REJECTED') {
    mappedStatus = 'REJECTED';
  } else if (order.approvalStatus === 'CANCELLED') {
    mappedStatus = 'CANCELLED';
  }

  return {
    id: String(order.orderId),
    classId: String(order.classId),
    classTitle: order.classTitle,
    studentId: order.studentId != null ? String(order.studentId) : undefined,
    studentName: order.studentName,
    studentEmail: order.studentEmail,
    status: mappedStatus,
    progressStatus: order.progressStatus,
    appliedAt: order.appliedAt?.split('T')[0] ?? '',
    price: order.price ?? 0,
  };
}

export async function applyClassOrder(request: ApplyClassOrderRequest): Promise<number> {
  const response = await apiClient.post<number>('/class-orders', request);
  return response.data;
}

export async function getMyClassOrders(): Promise<EnrollmentItem[]> {
  const response = await apiClient.get<ClassOrderSummaryResponse[]>('/class-orders/me');
  return response.data.map(mapClassOrderToEnrollment);
}

export async function getMyCompletedClassOrders(): Promise<EnrollmentItem[]> {
  const response = await apiClient.get<ClassOrderSummaryResponse[]>('/class-orders/me/completed');
  return response.data.map(mapClassOrderToEnrollment);
}

export async function getMyFreelancerClassOrders(): Promise<EnrollmentItem[]> {
  const response = await apiClient.get<ClassOrderSummaryResponse[]>('/class-orders/freelancer/me');
  return response.data.map(mapClassOrderToEnrollment);
}

export async function getFreelancerDashboard(params: {
  start: string;
  end: string;
}): Promise<FreelancerDashboardResponse> {
  const response = await apiClient.get<FreelancerDashboardResponse>('/class-orders/freelancer/me/dashboard', {
    params,
  });
  return response.data;
}

export async function getAdminClassOrders(): Promise<EnrollmentItem[]> {
  const response = await apiClient.get<ClassOrderSummaryResponse[]>('/class-orders/admin');
  return response.data.map(mapClassOrderToEnrollment);
}

export async function approveFreelancerClassOrder(orderId: string): Promise<void> {
  await apiClient.patch(`/class-orders/${orderId}/approve`);
}

export async function rejectFreelancerClassOrder(orderId: string): Promise<void> {
  await apiClient.patch(`/class-orders/${orderId}/reject`);
}

export async function completeFreelancerClassOrder(orderId: string): Promise<void> {
  await apiClient.patch(`/class-orders/${orderId}/complete`);
}

export async function excludeFreelancerClassOrder(orderId: string): Promise<void> {
  await apiClient.patch(`/class-orders/${orderId}/exclude`);
}

export async function cancelClassOrder(orderId: string): Promise<void> {
  await apiClient.patch(`/class-orders/${orderId}/cancel`);
}
