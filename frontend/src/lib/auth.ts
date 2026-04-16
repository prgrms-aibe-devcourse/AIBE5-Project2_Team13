export const ACCESS_TOKEN_KEY = 'accessToken';
export const USER_ROLE_KEY = 'userRole';
export const USER_EMAIL_KEY = 'userEmail';

export const getAccessToken = (): string | null =>
  sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token: string) => {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearAccessToken = () => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const setStoredUserContext = (role?: string, email?: string) => {
  if (role) {
    localStorage.setItem(USER_ROLE_KEY, role);
    sessionStorage.setItem(USER_ROLE_KEY, role);
  }

  if (email) {
    localStorage.setItem(USER_EMAIL_KEY, email);
    sessionStorage.setItem(USER_EMAIL_KEY, email);
  }
};

export const clearStoredUserContext = () => {
  localStorage.removeItem(USER_ROLE_KEY);
  sessionStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  sessionStorage.removeItem(USER_EMAIL_KEY);
};
