export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
export interface SyncResult {
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
}
declare class SyncManager {
    private isSyncing;
    private listeners;
    /**
     * Subscribe to sync status changes
     */
    onSyncStatusChange(callback: (status: SyncStatus, result?: SyncResult) => void): () => void;
    private notifyListeners;
    /**
     * Check if device is online
     */
    isOnline(): Promise<boolean>;
    /**
     * Start background sync listener
     */
    startAutoSync(): import("@react-native-community/netinfo").NetInfoSubscription;
    /**
     * Sync all pending operations
     */
    syncAll(): Promise<SyncResult>;
    /**
     * Process a single sync operation
     */
    private processOperation;
    /**
     * Sync create catch operation
     */
    private syncCreateCatch;
    /**
     * Sync update catch operation
     */
    private syncUpdateCatch;
    /**
     * Sync delete catch operation
     */
    private syncDeleteCatch;
    /**
     * Sync like catch operation
     */
    private syncLikeCatch;
    /**
     * Sync comment catch operation
     */
    private syncCommentCatch;
    /**
     * Force sync now (manual trigger)
     */
    forceSyncNow(): Promise<SyncResult>;
    /**
     * Get sync status
     */
    getSyncStatus(): boolean;
}
export declare const syncManager: SyncManager;
export {};
//# sourceMappingURL=syncManager.d.ts.map