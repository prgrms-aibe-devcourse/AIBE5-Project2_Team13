// AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@/src/api/axios";

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  const isLoggedIn = !!user;

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");

    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const me = await apiClient.get("/member/me");

        setUser({
          name: me.data.name,
          email: me.data.email,
          role: normalizeRole(me.data.role),
          imgUrl: me.data.imgUrl,
        });
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post("/auth/login", { email, password });

    sessionStorage.setItem("accessToken", res.data.accessToken);

    const me = await apiClient.get("/member/me");



    setUser({
      name: me.data.name,
      email: me.data.email,
      role: normalizeRole(me.data.role),
      imgUrl: me.data.imgUrl,
    });
  };

  const logout = () => {
      //2025/04/16.rtu.로컬스토리지를 아예 지우는 것보다는 로그인한 토큰 값을 날리는 게 더 좋아서 변경함
    //localStorage.clear();
    sessionStorage.removeItem("accessToken");

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthProvider 없음");
  return ctx;
};