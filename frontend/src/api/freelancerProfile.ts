import axios from "axios";
import apiClient from "./axios";

export type FreelancerProfileAttachment = {
  id: number;
  originalFileName: string;
  fileUrl: string;
};

export type FileUploadResponse = {
  // 공통 파일 모듈 응답 구조를 그대로 사용해 프리랜서 포트폴리오 업로드 결과를 재사용합니다.
  fileId: number;
  originalFileName: string;
  fileUrl: string;
  fileSize: number;
};

export type FreelancerProfileMeResponse = {
  freelancerId: number | null;
  profileId: number | null;
  memberName: string;
  memberEmail: string;
  memberPhone: string | null;
  memberAddress: string | null;
  specialtyCategoryId: number | null;
  specialtyCategoryName: string | null;
  snsLink: string | null;
  bio: string | null;
  career: string | null;
  bankAccount: string | null;
  approvalStatusCode: string | null;
  approvalStatusName: string | null;
  attachments: FreelancerProfileAttachment[];
};

export type FreelancerProfileDetailResponse = {
  // 공개 상세 페이지는 freelancerId 기준 조회이므로 회원 PK와 프로필 PK를 둘 다 받습니다.
  freelancerId: number;
  profileId: number;
  memberName: string;
  memberImageUrl: string | null;
  memberAddress: string | null;
  specialtyCategoryId: number | null;
  specialtyCategoryName: string | null;
  snsLink: string | null;
  bio: string | null;
  career: string | null;
  approvalStatusCode: string | null;
  approvalStatusName: string | null;
  attachments: FreelancerProfileAttachment[];
};

export type FreelancerProfileUpsertRequest = {
  specialtyCategoryId: number;
  snsLink?: string;
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

export const getFreelancerProfileByFreelancerId = async (
  freelancerId: number,
): Promise<FreelancerProfileDetailResponse> => {
  // 공개 프로필 조회는 인증 토큰 유무와 무관하게 접근 가능해야 하므로 공용 axios를 사용합니다.
  const res = await axios.get(`/api/auth/freelancer-profile/${freelancerId}`);
  return res.data;
};

export const uploadFreelancerPortfolioImages = async (
  profileId: number,
  files: File[],
): Promise<FileUploadResponse[]> => {
  // 프리랜서 전용 API를 새로 만들지 않고 공통 파일 모듈의 FREELANCER 타겟 업로드를 재사용합니다.
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const res = await apiClient.post(
    `/files/upload/multiple?targetType=FREELANCER&targetId=${profileId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
};

export const deleteFreelancerPortfolioImages = async (fileIds: number[]): Promise<void> => {
  if (fileIds.length === 0) {
        return;
  }

  // 저장 시점에 삭제 예정 기존 첨부만 묶어서 제거합니다.
  await apiClient.delete("/files/multiple?targetType=FREELANCER", {
    data: fileIds,
  });
};
