// AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import apiClient from "@/src/api/axios";
import { clearAccessToken, clearStoredUserContext, getAccessToken, setAccessToken, setStoredUserContext } from "@/src/lib/auth";

type User = {
  name: string;
  email: string;
  role: string;
  imgUrl?: string;
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshCurrentUser: () => Promise<void>;
  loading: boolean;
};


const AuthContext = createContext<AuthContextType | null>(null);

const normalizeRole = (role?: string): string => {
  if (!role) return 'USER';
  if (role === 'A') return 'ADMIN';
  if (role === 'F') return 'FREELANCER';
  if (role === 'U') return 'USER';

  const cleaned = role.replace('ROLE_', '');
  return ['ADMIN', 'FREELANCER', 'USER'].includes(cleaned)
    ? cleaned
    : 'USER';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getAccessToken());

  const loadCurrentUser = async () => {
    const [summaryRes, detailRes] = await Promise.all([
      apiClient.get("/member/me"),
      apiClient.get("/member/me/detail"),
    ]);

    const nextUser = {
      name: detailRes.data.name || summaryRes.data.name,
      email: detailRes.data.email,
      role: normalizeRole(summaryRes.data.role),
      imgUrl: detailRes.data.imgUrl,
    };

    setStoredUserContext(`ROLE_${nextUser.role}`, nextUser.email);
    setUser(nextUser);
    setIsLoggedIn(true);
  };

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);

    (async () => {
      try {
        await loadCurrentUser();
      } catch (error) {
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post("/auth/login", { email, password });

    setAccessToken(res.data.accessToken);
    setIsLoggedIn(true);
    await loadCurrentUser();
  };

  const logout = () => {
    clearAccessToken();
    clearStoredUserContext();
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, refreshCurrentUser: loadCurrentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider 없음");
  return ctx;
};
