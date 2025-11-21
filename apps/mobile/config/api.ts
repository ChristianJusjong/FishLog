// API configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

export const API_CONFIG = {
  BASE_URL: API_URL,
  TIMEOUT: 10000,
};

export default API_CONFIG;
