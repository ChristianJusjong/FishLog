import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authService } from '../lib/api';
import { setTokens, getSecureItem, clearTokens, TOKEN_KEYS } from '../lib/secureStorage';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  premium?: boolean;
  groqApiKey?: string;
  userId?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getAuthHeader: () => Promise<{ Authorization: string } | {}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Get token from secure storage
      const storedToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
      setToken(storedToken);

      if (storedToken) {
        // Race between API call and 10 second timeout (allow time for token refresh)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timeout')), 10000)
        );

        const apiPromise = authService.getProfile();

        const { data } = await Promise.race([apiPromise, timeoutPromise]) as any;
        setUser(data);
      } else {
      }
    } catch (error) {
      console.error('Auth check failed, clearing tokens:', error);
      // Clear tokens and user state on auth failure
      await clearTokens();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (accessToken: string, refreshToken: string) => {
    await setTokens(accessToken, refreshToken);
    setToken(accessToken);
    const { data } = await authService.getProfile();
    setUser(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      await clearTokens();
      setUser(null);
      setToken(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authService.getProfile();
      setUser(data);
    } catch (error) {
      console.error('Refresh user failed:', error);
    }
  }, []);

  const getAuthHeader = useCallback(async (): Promise<{ Authorization: string } | {}> => {
    const storedToken = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
    if (storedToken) {
      return { Authorization: `Bearer ${storedToken}` };
    }
    return {};
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    token,
    login,
    logout,
    refreshUser,
    getAuthHeader
  }), [user, loading, token, login, logout, refreshUser, getAuthHeader]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
