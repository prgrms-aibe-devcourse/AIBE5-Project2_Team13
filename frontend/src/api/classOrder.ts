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
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'| 'CANCELLED';
  appliedAt: string;
  studentName: string;
  studentEmail: string;
}

export async function getMyClassOrders(): Promise<EnrollmentItem[]> {
  const response = await apiClient.get<ClassOrderSummaryResponse[]>('/class-orders/me');

  // 서버에서 진짜 데이터가 어떻게 오는지 눈으로 확인
  console.log("🔍 [디버깅] 서버 응답 데이터 구조:", response.data);

  return response.data.map((order) => {
    // 개별 데이터 확인
    console.log("🔍 [디버깅] 매핑 중인 order 객체:", order);

    let mappedStatus: EnrollmentStatus = 'PENDING';

    if (order.approvalStatus === 'APPROVED') {
      mappedStatus = 'APPROVED';
    } else if (order.approvalStatus === 'REJECTED' || order.approvalStatus === 'CANCELLED') {
      mappedStatus = 'CANCELLED';
    }

    return {
      id: String(order.orderId), // 🚨 만약 이게 undefined라면 order.id 인지 확인하세요
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

export async function cancelClassOrder(orderId: string): Promise<void> {
  //클래스 신청 취소 오류 원인 잡으려고 추가함
  // 💡 로그를 찍어서 진짜 어떤 ID가 오는지 눈으로 확인!
  console.log("🔥 [디버깅] 서버로 보낼 ID 값:", orderId);

  if (orderId === 'undefined') {
    console.error("🚨 ID가 undefined임. 매핑이 잘못됐습니다.");
    return; // 요청 보내지 말고 여기서 멈춤
  }

  await apiClient.patch(`/class-orders/${orderId}/cancel`);
}