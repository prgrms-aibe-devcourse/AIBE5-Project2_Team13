import apiClient from "./axios";

export type FindEmailRequest = {
  name: string;
  phone: string;
  birth: string;
};

export type FindEmailResponse = {
  email: string;
};

export const findEmail = async (payload: FindEmailRequest): Promise<FindEmailResponse> => {
  const res = await apiClient.post("/auth/find-email", payload);
  return res.data;
};
