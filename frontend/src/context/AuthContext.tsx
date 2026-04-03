import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  httpClient,
  rawClient,
  persistSession,
  clearSession,
  setUnauthorizedHandler,
} from "../services/httpClient";
import type { AuthContextValue, User } from "../types/auth";
import { toApiError } from "../types/api";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

function unwrapLoginResponse(data: unknown) {
  const d = data as {
    success?: boolean;
    data?: { user?: User; accessToken?: string; refreshToken?: string };
    error?: { message?: string; code?: string; details?: unknown };
  };
  if (d?.success === true) return d.data;
  const msg = d?.error?.message || "Request failed";
  throw toApiError(msg, d?.error?.code, d?.error?.details);
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearAuth);
    return () => setUnauthorizedHandler(null);
  }, [clearAuth]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = localStorage.getItem("pms_access_token");
      if (!token) {
        const saved = localStorage.getItem("pms_user");
        if (saved) clearSession();
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const { data } = await httpClient.get("/api/users/me");
        const payload = unwrapLoginResponse(data) as { user?: User } | undefined;
        if (!cancelled && payload?.user) {
          setUser(payload.user);
          localStorage.setItem("pms_user", JSON.stringify(payload.user));
        }
      } catch {
        clearAuth();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [clearAuth]);

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const { data } = await rawClient.post("/api/auth/login", { email, password });
    const payload = unwrapLoginResponse(data) as {
      user: User;
      accessToken: string;
      refreshToken: string;
    };
    const { user: u, accessToken, refreshToken } = payload;
    persistSession({ accessToken, refreshToken, user: u });
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await httpClient.post("/api/auth/logout");
    } catch {
      /* best-effort */
    }
    clearAuth();
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await httpClient.get("/api/users/me");
      const payload = unwrapLoginResponse(data) as { user?: User } | undefined;
      if (payload?.user) {
        setUser(payload.user);
        localStorage.setItem("pms_user", JSON.stringify(payload.user));
      }
    } catch {
      /* best-effort */
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, refreshUser, isAuthenticated: !!user, loading }}
    >
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-primary font-medium">
          Loading…
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
