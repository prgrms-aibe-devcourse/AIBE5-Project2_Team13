import apiClient from "./axios";

export type FreelancerProfileAttachment = {
  id: number;
  originalFileName: string;
  fileUrl: string;
};

export type FreelancerProfileMeResponse = {
  profileId: number | null;
  memberName: string;
  memberEmail: string;
  memberPhone: string | null;
  memberAddress: string | null;
  specialtyCategoryId: number | null;
  specialtyCategoryName: string | null;
  snsLink: string;
  bio: string | null;
  career: string | null;
  bankAccount: string | null;
  approvalStatusCode: string | null;
  approvalStatusName: string | null;
  attachments: FreelancerProfileAttachment[];
};

export type FreelancerProfileUpsertRequest = {
  memberName: string;
  specialtyCategoryId: number;
  snsLink: string;
  bio?: string;
  career?: string;
  bankAccount?: string;
};

export const getMyFreelancerProfile = async (): Promise<FreelancerProfileMeResponse> => {
  const res = await apiClient.get("/freelancer-profile/me");
  return res.data;
};

export const upsertMyFreelancerProfile = async (
  payload: FreelancerProfileUpsertRequest,
): Promise<FreelancerProfileMeResponse> => {
  const res = await apiClient.put("/freelancer-profile/me", payload);
  return res.data;
};
