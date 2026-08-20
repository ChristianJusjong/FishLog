import React, { ReactNode } from 'react';
import { SyncStatus, SyncResult } from '../lib/syncManager';
interface OfflineContextType {
    isOnline: boolean;
    syncStatus: SyncStatus;
    lastSyncResult: SyncResult | null;
    forceSyncNow: () => Promise<void>;
}
export declare function OfflineProvider({ children }: {
    children: ReactNode;
}): React.JSX.Element;
export declare function useOffline(): OfflineContextType;
export {};
//# sourceMappingURL=OfflineContext.d.ts.map