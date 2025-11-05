import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncManager, SyncStatus, SyncResult } from '../lib/syncManager';

interface OfflineContextType {
  isOnline: boolean;
  syncStatus: SyncStatus;
  lastSyncResult: SyncResult | null;
  forceSyncNow: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  useEffect(() => {
    // Listen to network changes
    const unsubscribeNetwork = NetInfo.addEventListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      console.log('Network status changed:', online ? 'online' : 'offline');
    });

    // Listen to sync status changes
    const unsubscribeSync = syncManager.onSyncStatusChange((status, result) => {
      setSyncStatus(status);
      if (result) {
        setLastSyncResult(result);
      }
    });

    // Start auto-sync
    const unsubscribeAutoSync = syncManager.startAutoSync();

    // Initial network check
    NetInfo.fetch().then((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
    });

    return () => {
      unsubscribeNetwork();
      unsubscribeSync();
      unsubscribeAutoSync();
    };
  }, []);

  const forceSyncNow = async () => {
    if (!isOnline) {
      console.log('Cannot sync while offline');
      return;
    }

    try {
      const result = await syncManager.forceSyncNow();
      setLastSyncResult(result);
    } catch (error) {
      console.error('Force sync error:', error);
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        syncStatus,
        lastSyncResult,
        forceSyncNow,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
