import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { getSecureItem, TOKEN_KEYS } from '@/lib/secureStorage';
import { API_URL } from '@/config/api';

export type SubscriptionTier = 'free' | 'pro' | 'premium';

interface SubscriptionContextType {
  tier: SubscriptionTier;
  isPro: boolean;
  isAdFree: boolean;
  loading: boolean;
  upgradeToPro: (plan: 'monthly' | 'yearly') => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  setMockTier: (tier: SubscriptionTier) => Promise<void>;
}

const STORAGE_KEY = '@hook_subscription_tier_v1';

const SubscriptionContext = createContext<SubscriptionContextType>({
  tier: 'free',
  isPro: false,
  isAdFree: false,
  loading: true,
  upgradeToPro: async () => false,
  restorePurchases: async () => false,
  setMockTier: async () => {},
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      // 1. Check local cache
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached === 'pro' || cached === 'premium') {
        setTier(cached as SubscriptionTier);
      }

      // 2. Fetch from backend
      const token = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
      if (token) {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const user = await res.json();
          const serverTier = user.premium?.tier || user.tier || 'free';
          setTier(serverTier);
          await AsyncStorage.setItem(STORAGE_KEY, serverTier);
        }
      }
    } catch {
      // Keep cached tier
    } finally {
      setLoading(false);
    }
  };

  const upgradeToPro = async (plan: 'monthly' | 'yearly'): Promise<boolean> => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      // In production: trigger Apple In-App Purchase / Google Play Billing
      // Persist Pro state
      setTier('pro');
      await AsyncStorage.setItem(STORAGE_KEY, 'pro');

      const token = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
      if (token) {
        await fetch(`${API_URL}/users/me`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tier: 'pro' }),
        }).catch(() => {});
      }
      return true;
    } catch {
      return false;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    await loadSubscription();
    return tier === 'pro' || tier === 'premium';
  };

  const setMockTier = async (newTier: SubscriptionTier) => {
    setTier(newTier);
    await AsyncStorage.setItem(STORAGE_KEY, newTier);
  };

  const isPro = tier === 'pro' || tier === 'premium';
  const isAdFree = isPro;

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        isPro,
        isAdFree,
        loading,
        upgradeToPro,
        restorePurchases,
        setMockTier,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
