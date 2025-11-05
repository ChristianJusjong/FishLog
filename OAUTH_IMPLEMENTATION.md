# OAuth 2.0 Implementation - FishLog

## ✅ Completed Backend Implementation

### Database Schema
- **User Model** created with fields:
  - id (cuid)
  - email (unique)
  - name
  - avatar
  - provider (google/facebook)
  - providerId (OAuth provider's user ID)
  - refreshToken
  - createdAt, updatedAt

### Backend Endpoints (http://localhost:3000)

#### Authentication Endpoints:
- `GET /auth/google` - Initiates Google OAuth flow
- `GET /auth/google/callback` - Handles Google OAuth callback
- `GET /auth/facebook` - Initiates Facebook OAuth flow
- `GET /auth/facebook/callback` - Handles Facebook OAuth callback
- `POST /auth/refresh` - Refreshes access token
- `POST /auth/logout` - Logs out and invalidates refresh token

#### User Endpoints:
- `GET /users/me` - Get authenticated user profile (requires Bearer token)
- `PATCH /users/me` - Update user profile (requires Bearer token)

### JWT Configuration
- Access Token: 15 minutes expiry
- Refresh Token: 7 days expiry
- Tokens stored in PostgreSQL database

### OAuth Credentials Configured
✅ Google OAuth credentials added to `.env`
✅ Facebook OAuth credentials added to `.env`

## 🚧 Mobile App Implementation Needed

### Files to Create:

#### 1. API Client (`lib/api.ts`)
```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
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
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          await AsyncStorage.setItem('accessToken', data.accessToken);
          await AsyncStorage.setItem('refreshToken', data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return axios(error.config);
        } catch {
          // Refresh failed, logout
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: { name?: string; avatar?: string }) =>
    api.patch('/users/me', data),
  logout: async () => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    await api.post('/auth/logout', { refreshToken });
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
  },
};
```

#### 2. Auth Context (`contexts/AuthContext.tsx`)
```typescript
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
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        const { data } = await authService.getProfile();
        setUser(data);
      }
    } catch (error) {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    } finally {
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
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await authService.getProfile();
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

#### 3. Login Screen (`app/login.tsx`)
```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';

const API_URL = 'http://localhost:3000';

export default function LoginScreen() {
  const handleGoogleLogin = () => {
    Linking.openURL(`${API_URL}/auth/google`);
  };

  const handleFacebookLogin = () => {
    Linking.openURL(`${API_URL}/auth/facebook`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FishLog</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={handleGoogleLogin}>
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.facebookButton]} onPress={handleFacebookLogin}>
        <Text style={styles.buttonText}>Continue with Facebook</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 40, textAlign: 'center' },
  button: { padding: 16, borderRadius: 8, marginBottom: 12 },
  googleButton: { backgroundColor: '#4285F4' },
  facebookButton: { backgroundColor: '#1877F2' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
```

#### 4. Auth Callback Handler (`app/auth/callback.tsx`)
```typescript
import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthCallback() {
  const { accessToken, refreshToken } = useLocalSearchParams();
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    if (accessToken && refreshToken) {
      await login(accessToken as string, refreshToken as string);
      router.replace('/profile');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text>Logging in...</Text>
    </View>
  );
}
```

#### 5. Profile Screen (`app/profile.tsx`)
```typescript
import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, loading, logout, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {user.avatar && (
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user.name}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Provider:</Text>
        <Text style={styles.value}>{user.provider}</Text>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={refreshUser}>
        <Text style={styles.buttonText}>Refresh Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 20 },
  infoContainer: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12 },
  label: { fontSize: 12, color: '#666', marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '500' },
  refreshButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, marginTop: 20 },
  logoutButton: { backgroundColor: '#FF3B30', padding: 16, borderRadius: 8, marginTop: 12 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
```

#### 6. Update Layout (`app/_layout.tsx`)
```typescript
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
```

#### 7. Update Index (`app/index.tsx`)
```typescript
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/profile' : '/login');
    }
  }, [user, loading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
```

## Testing the OAuth Flow

### Step 1: Start Services
```bash
# Backend (already running)
cd apps/backend && npm run dev

# Mobile
cd apps/mobile && npm run dev
```

### Step 2: Test Flow
1. Open app in browser/device
2. Click "Continue with Google" or "Continue with Facebook"
3. Complete OAuth authorization
4. Get redirected back with tokens
5. See profile screen with user info

### Step 3: Test API
```bash
# Get user profile
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/users/me

# Refresh token
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

## Summary

✅ Backend fully implemented with OAuth 2.0
✅ Google & Facebook OAuth configured
✅ JWT tokens (access + refresh)
✅ User management endpoints
✅ Database schema ready

📝 Mobile app code provided above - needs to be created
🧪 Ready for end-to-end testing once mobile files are created
