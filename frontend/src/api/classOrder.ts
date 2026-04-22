import apiClient from './axios';
import { EnrollmentItem, EnrollmentStatus } from '@/src/constants';

interface ApplyClassOrderRequest {
  classBoardId: number;
}

// [기능 설명: 클래스 주문 요약 데이터를 정의하는 인터페이스] [작성 이유: API로부터 응답받는 주문 요약 정보의 데이터 구조를 타입 안전하게 관리하기 위해 작성함]
interface ClassOrderSummaryResponse {
  orderId: number;
  classId: number;
  classTitle: string;
  price: number;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  progressStatus: 'BEFORE_START' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
  appliedAt: string;
  studentName: string;
  studentEmail: string;
}

// 클래스 주문 응답 데이터를 수강 신청 항목으로 변환하기 위해, API의 승인 상태(ApprovalStatus)를 내부의 수강 신청 상태(EnrollmentStatus)로 매핑합니다.
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
    studentName: order.studentName,
    studentEmail: order.studentEmail,
    status: mappedStatus,
    progressStatus: order.progressStatus,
    appliedAt: order.appliedAt?.split('T')[0] ?? '',
    price: order.price ?? 0,
  };
}

// [기능 설명: 클래스 수강 신청을 위해 서버에 주문 요청을 전송하고 생성된 주문 ID를 반환합니다.] [작성 이유: 수강 신청 프로세스를 수행하고 결과를 관리하기 위해 작성함]
export async function applyClassOrder(request: ApplyClassOrderRequest): Promise<number> {
  const response = await apiClient.post<number>('/class-orders', request);
  return response.data;
}

// [기능 설명: 로그인한 학생의 수강 신청 내역을 조회하여 EnrollmentItem 리스트로 매핑합니다.] [작성 이유: 학생 대시보드에 현재 신청 현황을 표시하기 위해 작성함]
export async function getMyClassOrders(): Promise<EnrollmentItem[]> {
  const response = await apiClient.get<ClassOrderSummaryResponse[]>('/class-orders/me');
  return response.data.map(mapClassOrderToEnrollment);
}

export async function getMyCompletedClassOrders(): Promise<EnrollmentItem[]> {
  const response = await apiClient.get<ClassOrderSummaryResponse[]>('/class-orders/me/completed');
  return response.data.map(mapClassOrderToEnrollment);
}


// [기능 설명: 로그인한 프리랜서가 받은 클래스 주문 내역을 조회하여 EnrollmentItem 리스트로 매핑합니다.] [작성 이유: 프리랜서 대시보드에서 들어온 수강 신청들을 확인하고 관리하기 위해 작성함]
export async function getMyFreelancerClassOrders(): Promise<EnrollmentItem[]> {
  const response = await apiClient.get<ClassOrderSummaryResponse[]>('/class-orders/freelancer/me');
  return response.data.map(mapClassOrderToEnrollment);
}

// [기능 설명: 프리랜서가 특정 클래스 주문을 승인하는 요청을 서버로 전송합니다.] [작성 이유: 수강 신청 승인 기능을 구현하여 프리랜서가 학생의 신청을 최종 확정할 수 있도록 하기 위해 작성함]
export async function getAdminClassOrders(): Promise<EnrollmentItem[]> {
  const response = await apiClient.get<ClassOrderSummaryResponse[]>('/class-orders/admin');
  return response.data.map(mapClassOrderToEnrollment);
}

export async function approveFreelancerClassOrder(orderId: string): Promise<void> {
  await apiClient.patch(`/class-orders/${orderId}/approve`);
}

// [기능 설명: 프리랜서가 특정 클래스 주문을 거절하는 요청을 서버로 전송합니다.] [작성 이유: 부적합한 수강 신청을 처리하거나 반려할 수 있는 기능을 제공하기 위해 작성함]
export async function rejectFreelancerClassOrder(orderId: string): Promise<void> {
  await apiClient.patch(`/class-orders/${orderId}/reject`);
}

// [기능 설명: 프리랜서가 특정 클래스 주문을 완료 처리하여 수강 종료를 확정합니다.] [작성 이유: 클래스가 정상적으로 종료된 후 주문 상태를 '완료'로 변경하여 최종 수강 기록을 관리하기 위해 작성함]
export async function completeFreelancerClassOrder(orderId: string): Promise<void> {
  await apiClient.patch(`/class-orders/${orderId}/complete`);
}

// [기능 설명: 특정 클래스 주문을 제외(exclude) 처리하여 수강 대상에서 제외합니다.] [작성 이유: 수강 중인 학생이 중도 하차하거나 기타 사유로 수강 대상에서 제거해야 할 경우 상태를 업데이트하기 위해 작성함]
export async function excludeFreelancerClassOrder(orderId: string): Promise<void> {
  await apiClient.patch(`/class-orders/${orderId}/exclude`);
}

export async function cancelClassOrder(orderId: string): Promise<void> {
  await apiClient.patch(`/class-orders/${orderId}/cancel`);
}
