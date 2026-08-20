import axios from 'axios';
import { getSecureItem, setTokens, clearTokens, TOKEN_KEYS } from './secureStorage';
import { API_URL } from '../config/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track if we're currently refreshing to avoid multiple refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if already retried or if it's a refresh request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = await getSecureItem(TOKEN_KEYS.REFRESH_TOKEN);
      if (refreshToken && !isRefreshing) {
        isRefreshing = true;

        try {
          refreshPromise = axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { data } = await refreshPromise;
          await setTokens(data.accessToken, data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          isRefreshing = false;
          refreshPromise = null;
          return api(originalRequest);
        } catch (refreshErr) {
          isRefreshing = false;
          refreshPromise = null;
          return Promise.reject(refreshErr);
        }
      } else if (isRefreshing && refreshPromise) {
        // Wait for ongoing refresh
        try {
          const { data } = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          return Promise.reject(refreshErr);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: { name?: string; avatar?: string; groqApiKey?: string; geminiApiKey?: string; profileVisibility?: string }) =>
    api.patch('/users/me', data),
  logout: async () => {
    const refreshToken = await getSecureItem(TOKEN_KEYS.REFRESH_TOKEN);
    await api.post('/auth/logout', { refreshToken });
    await clearTokens();
  },
};
