import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '';

export const rawClient = axios.create({ baseURL });

let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = typeof fn === 'function' ? fn : () => {};
}

const ACCESS = 'pms_access_token';
const REFRESH = 'pms_refresh_token';

export function getAccessToken() {
  return localStorage.getItem(ACCESS);
}

export function persistSession({ accessToken, refreshToken, user }) {
  if (accessToken) localStorage.setItem(ACCESS, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH, refreshToken);
  if (user !== undefined && user !== null)
    localStorage.setItem('pms_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
  localStorage.removeItem('pms_user');
}

export const httpClient = axios.create({ baseURL });

httpClient.interceptors.request.use((config) => {
  const t = getAccessToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

httpClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    const res = error.response;
    const cfg = error.config;
    if (!res || res.status !== 401 || !cfg || cfg._retry) return Promise.reject(error);

    const url = typeof cfg.url === 'string' ? cfg.url : '';
    if (url.includes('/api/auth/refresh') || url.includes('/api/auth/login')) {
      return Promise.reject(error);
    }

    const rt = localStorage.getItem(REFRESH);
    if (!rt) {
      onUnauthorized();
      return Promise.reject(error);
    }

    cfg._retry = true;
    try {
      const { data: body } = await rawClient.post('/api/auth/refresh', { refreshToken: rt });
      if (!body?.success || !body.data?.accessToken) throw new Error('refresh failed');
      const { accessToken, refreshToken: newRt } = body.data;
      localStorage.setItem(ACCESS, accessToken);
      if (newRt) localStorage.setItem(REFRESH, newRt);
      cfg.headers.Authorization = `Bearer ${accessToken}`;
      return httpClient(cfg);
    } catch {
      onUnauthorized();
      return Promise.reject(error);
    }
  }
);
