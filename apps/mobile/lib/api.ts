import axios from 'axios';
import { getSecureItem, setTokens, clearTokens, TOKEN_KEYS } from './secureStorage';

// Use environment variable for API URL (falls back to production if not set)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

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

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await getSecureItem(TOKEN_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          await setTokens(data.accessToken, data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios(error.config);
        } catch {
          // Refresh failed, logout
          await clearTokens();
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: { name?: string; avatar?: string; groqApiKey?: string }) =>
    api.patch('/users/me', data),
  logout: async () => {
    const refreshToken = await getSecureItem(TOKEN_KEYS.REFRESH_TOKEN);
    await api.post('/auth/logout', { refreshToken });
    await clearTokens();
  },
};
