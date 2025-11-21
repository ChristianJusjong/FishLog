import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider mounted, checking auth...');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('checkAuth started');
    try {
      // Add timeout to prevent app from stalling
      const token = await AsyncStorage.getItem('accessToken');
      console.log('Token from storage:', token ? 'exists' : 'none');

      if (token) {
        // Race between API call and 10 second timeout (allow time for token refresh)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timeout')), 10000)
        );

        const apiPromise = authService.getProfile();

        const { data } = await Promise.race([apiPromise, timeoutPromise]) as any;
        console.log('User profile loaded:', data);
        setUser(data);
      } else {
        console.log('No token, skipping profile fetch');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    } finally {
      console.log('checkAuth finished, setting loading to false');
      setLoading(false);
    }
  };

  const login = async (accessToken: string, refreshToken: string) => {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    const { data } = await authService.getProfile();
    setUser(data);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await authService.getProfile();
      setUser(data);
    } catch (error) {
      console.error('Refresh user failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
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
