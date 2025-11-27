import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SecureStore is not available on web, so we fall back to AsyncStorage
// In production, you should implement a more secure web solution

const isSecureStoreAvailable = Platform.OS !== 'web';

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (isSecureStoreAvailable) {
    await SecureStore.setItemAsync(key, value);
  } else {
    // Fallback for web - AsyncStorage is not secure but works
    await AsyncStorage.setItem(key, value);
  }
}

export async function getSecureItem(key: string): Promise<string | null> {
  if (isSecureStoreAvailable) {
    return await SecureStore.getItemAsync(key);
  } else {
    return await AsyncStorage.getItem(key);
  }
}

export async function deleteSecureItem(key: string): Promise<void> {
  if (isSecureStoreAvailable) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    setSecureItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken),
    setSecureItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken),
  ]);
}

export async function getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
  const [accessToken, refreshToken] = await Promise.all([
    getSecureItem(TOKEN_KEYS.ACCESS_TOKEN),
    getSecureItem(TOKEN_KEYS.REFRESH_TOKEN),
  ]);
  return { accessToken, refreshToken };
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    deleteSecureItem(TOKEN_KEYS.ACCESS_TOKEN),
    deleteSecureItem(TOKEN_KEYS.REFRESH_TOKEN),
  ]);
}
