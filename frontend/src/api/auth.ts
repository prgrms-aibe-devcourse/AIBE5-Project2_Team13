import apiClient from "./axios";

export type FindEmailRequest = {
  name: string;
  phone: string;
  birth: string;
};

export type FindEmailResponse = {
  email: string;
};

export type PasswordResetRequest = {
  name: string;
  email: string;
  phone: string;
  birth: string;
  newPassword: string;
};

export type PasswordResetVerifyRequest = {
  name: string;
  email: string;
  phone: string;
  birth: string;
};

export const findEmail = async (payload: FindEmailRequest): Promise<FindEmailResponse> => {
  const res = await apiClient.post("/auth/find-email", payload);
  return res.data;
};

export const resetPassword = async (payload: PasswordResetRequest): Promise<{ message: string }> => {
  const res = await apiClient.post("/auth/reset-password", payload);
  return res.data;
};

export const verifyResetPasswordIdentity = async (payload: PasswordResetVerifyRequest): Promise<{ message: string }> => {
  const res = await apiClient.post("/auth/reset-password/verify", payload);
  return res.data;
};
