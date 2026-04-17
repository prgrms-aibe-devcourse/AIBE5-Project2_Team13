const FREELANCER_APPLICATION_STATUS_KEY = 'freelancerApplicationStatus';

export const getStoredFreelancerApplicationStatus = (): string | null =>
  localStorage.getItem(FREELANCER_APPLICATION_STATUS_KEY);

export const setStoredFreelancerApplicationStatus = (status: string) => {
  localStorage.setItem(FREELANCER_APPLICATION_STATUS_KEY, status);
};

export const clearStoredFreelancerApplicationStatus = () => {
  localStorage.removeItem(FREELANCER_APPLICATION_STATUS_KEY);
};
