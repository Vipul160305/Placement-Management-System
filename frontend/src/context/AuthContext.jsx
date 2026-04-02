import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  httpClient,
  rawClient,
  persistSession,
  clearSession,
  setUnauthorizedHandler,
} from '../services/httpClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

function unwrapLoginResponse(data) {
  if (data?.success === true) return data.data;
  const msg = data?.error?.message || 'Request failed';
  const err = new Error(msg);
  err.code = data?.error?.code;
  err.details = data?.error?.details;
  throw err;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearAuth);
    return () => setUnauthorizedHandler(() => {});
  }, [clearAuth]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = localStorage.getItem('pms_access_token');
      if (!token) {
        const saved = localStorage.getItem('pms_user');
        if (saved) clearSession();
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const { data } = await httpClient.get('/api/users/me');
        const payload = unwrapLoginResponse(data);
        if (!cancelled && payload?.user) {
          setUser(payload.user);
          localStorage.setItem('pms_user', JSON.stringify(payload.user));
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

  const login = useCallback(async ({ email, password }) => {
    const { data } = await rawClient.post('/api/auth/login', { email, password });
    const payload = unwrapLoginResponse(data);
    const { user: u, accessToken, refreshToken } = payload;
    persistSession({ accessToken, refreshToken, user: u });
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await httpClient.post('/api/auth/logout');
    } catch {
      /* best-effort */
    }
    clearAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user, loading }}
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
