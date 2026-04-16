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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const LOGIN_ALERT_KEY = "loginAlertShown";

  const isLoggedIn = !!user;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

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
          role: me.data.roleCode,
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

    localStorage.setItem("accessToken", res.data.accessToken);

    const me = await apiClient.get("/member/me");

    setUser({
      name: me.data.name,
      email: me.data.email,
      role: me.data.roleCode,
      imgUrl: me.data.imgUrl,
    });

    if (!sessionStorage.getItem(LOGIN_ALERT_KEY)) {
      alert("로그인 성공");
      sessionStorage.setItem(LOGIN_ALERT_KEY, "true");
    }
  };

  const logout = () => {
      //2025/04/16.rtu.로컬스토리지를 아예 지우는 것보다는 로그인한 토큰 값을 날리는 게 더 좋아서 변경함
    //localStorage.clear();
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem(LOGIN_ALERT_KEY);

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