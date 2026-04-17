import apiClient from "./axios";

export type FreelancerProfileApplyRequest = {
  memberName: string;
  specialtyCategoryId: number;
  snsLink: string;
  bio?: string;
  career?: string;
  bankAccount?: string;
};

export type FreelancerApprovalListItemResponse = {
  profileId: number;
  memberName: string;
  memberEmail: string;
  specialtyCategoryName: string;
  career: string | null;
  snsLink: string | null;
  approvalStatusCode: string;
  approvalStatusName: string | null;
  appliedAt: string;
};

export type FreelancerApplicationStatusResponse = {
  hasProfile: boolean;
  approvalStatusCode: string | null;
  approvalStatusName: string | null;
};

export const applyFreelancerProfile = async (payload: FreelancerProfileApplyRequest): Promise<number> => {
  const res = await apiClient.post("/freelancer-profile/apply", payload);
  return res.data;
};

export const getPendingFreelancerProfiles = async (): Promise<FreelancerApprovalListItemResponse[]> => {
  const res = await apiClient.get("/freelancer-profile/admin/pending");
  return res.data;
};

export const approveFreelancerProfile = async (profileId: number): Promise<void> => {
  await apiClient.patch(`/freelancer-profile/admin/${profileId}/approve`);
};

export const rejectFreelancerProfile = async (profileId: number): Promise<void> => {
  await apiClient.patch(`/freelancer-profile/admin/${profileId}/reject`);
};

export const getFreelancerApplicationStatus = async (): Promise<FreelancerApplicationStatusResponse> => {
  const res = await apiClient.get("/freelancer-profile/application-status");
  return res.data;
};
