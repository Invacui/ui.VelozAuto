import axios from 'axios';
import { store } from '@/store';
import { setToken, setRefreshToken, clearAuth } from '@/store/auth.slice';

export const api = axios.create({
  baseURL: `${import.meta.env.APP_API_URL}/api/v1`,
  withCredentials: true,
  timeout: 20_000,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken || localStorage.getItem('vm-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

api.interceptors.response.use(
  (res) => res,
  async (err: unknown) => {
    if (!axios.isAxiosError(err)) return Promise.reject(err);
    const orig = err.config as typeof err.config & { _retry?: boolean };
    if (err.response?.status !== 401 || orig?._retry) return Promise.reject(err);

    // Never try to refresh on the auth endpoints themselves.
    if (
      orig?.url?.includes('/auth/login') ||
      orig?.url?.includes('/auth/register') ||
      orig?.url?.includes('/auth/google') ||
      orig?.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => refreshQueue.push({ resolve, reject })).then(
        (token) => {
          if (orig?.headers) orig.headers.Authorization = `Bearer ${token as string}`;
          return api(orig!);
        },
      );
    }

    orig!._retry = true;
    isRefreshing = true;

    try {
      const refreshToken =
        store.getState().auth.refreshToken || localStorage.getItem('vm-refresh-token');
      const { data } = await axios.post<{
        success: boolean;
        data: { accessToken: string; refreshToken?: string };
      }>(
        `${import.meta.env.APP_API_URL}/api/v1/auth/refresh`,
        { refreshToken },
        { withCredentials: true },
      );
      const nextAccessToken = data.data.accessToken;
      store.dispatch(setToken(nextAccessToken));
      if (data.data.refreshToken) {
        store.dispatch(setRefreshToken(data.data.refreshToken));
      }
      refreshQueue.forEach((q) => q.resolve(nextAccessToken));
      if (orig?.headers) orig.headers.Authorization = `Bearer ${nextAccessToken}`;
      return api(orig!);
    } catch (e) {
      refreshQueue.forEach((q) => q.reject(e));
      store.dispatch(clearAuth());
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?reason=session_expired';
      }
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
      refreshQueue = [];
    }
  },
);
