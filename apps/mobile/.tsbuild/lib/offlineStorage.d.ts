export interface OfflineCatch {
    id: string;
    species: string;
    lengthCm?: number;
    weightKg?: number;
    bait?: string;
    lure?: string;
    rig?: string;
    technique?: string;
    notes?: string;
    latitude?: number;
    longitude?: number;
    photoUrl?: string;
    visibility?: string;
    createdAt: string;
    userId?: string;
    synced: boolean;
}
export interface SyncOperation {
    id: string;
    type: 'create_catch' | 'update_catch' | 'delete_catch' | 'like_catch' | 'comment_catch';
    data: any;
    timestamp: string;
    retries: number;
}
export interface FeedItem {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    species: string;
    weightKg?: number;
    lengthCm?: number;
    photoUrl?: string;
    notes?: string;
    latitude?: number;
    longitude?: number;
    createdAt: string;
    likes: number;
    comments: number;
}
declare class OfflineStorage {
    saveCatch(catch_: OfflineCatch): Promise<void>;
    getCatches(): Promise<OfflineCatch[]>;
    updateCatch(catchId: string, updates: Partial<OfflineCatch>): Promise<void>;
    deleteCatch(catchId: string): Promise<void>;
    markCatchSynced(catchId: string): Promise<void>;
    clearSyncedCatches(): Promise<void>;
    saveFeed(feed: FeedItem[]): Promise<void>;
    getFeed(): Promise<FeedItem[]>;
    clearFeed(): Promise<void>;
    addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retries'>): Promise<void>;
    getSyncQueue(): Promise<SyncOperation[]>;
    removeFromSyncQueue(operationId: string): Promise<void>;
    incrementRetryCount(operationId: string): Promise<void>;
    clearSyncQueue(): Promise<void>;
    setLastSyncTime(timestamp: string): Promise<void>;
    getLastSyncTime(): Promise<string | null>;
    isFirstLaunch(): Promise<boolean>;
    setNotFirstLaunch(): Promise<void>;
    clearAll(): Promise<void>;
    getStorageStats(): Promise<{
        catches: number;
        feed: number;
        syncQueue: number;
        lastSync: string | null;
    }>;
}
export declare const offlineStorage: OfflineStorage;
export {};
//# sourceMappingURL=offlineStorage.d.ts.map