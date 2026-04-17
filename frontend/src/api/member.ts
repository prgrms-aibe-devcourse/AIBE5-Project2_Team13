import apiClient from "./axios";

export type MemberDetail = {
  imgUrl?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  addr?: string | null;
  addr2?: string | null;
};

export type MemberUpdateRequest = {
  name: string;
  phone?: string | null;
  addr?: string | null;
  addr2?: string | null;
};

export type MemberPasswordUpdateRequest = {
  currentPassword: string;
  newPassword: string;
};

export type AdminMemberListItem = {
  id: number;
  email: string;
  name: string;
  birth: string;
  role: "ROLE_USER" | "ROLE_FREELANCER" | "ROLE_ADMIN";
  phone: string;
  address: string;
  joinedAt: string;
  quitAt?: string | null;
  isDeleted: boolean;
};

export const getMyDetail = async (): Promise<MemberDetail> => {
  const res = await apiClient.get("/member/me/detail");
  return res.data;
};

export const updateMyDetail = async (payload: MemberUpdateRequest): Promise<MemberDetail> => {
  const res = await apiClient.put("/member/me/detail", payload);
  return res.data;
};

export const updateMyPassword = async (payload: MemberPasswordUpdateRequest): Promise<void> => {
  await apiClient.put("/member/me/password", payload);
};

export const getAdminMembers = async (): Promise<AdminMemberListItem[]> => {
  const res = await apiClient.get("/member/admin/users");
  return res.data;
};

export const updateMemberRole = async (
  memberId: number,
  role: AdminMemberListItem["role"],
): Promise<AdminMemberListItem> => {
  const res = await apiClient.put(`/member/admin/users/${memberId}/role`, { role });
  return res.data;
};
