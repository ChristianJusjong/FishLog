import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
  CATCHES: '@fishlog:offline_catches',
  FEED: '@fishlog:offline_feed',
  SYNC_QUEUE: '@fishlog:sync_queue',
  LAST_SYNC: '@fishlog:last_sync',
  IS_FIRST_LAUNCH: '@fishlog:is_first_launch',
};

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

class OfflineStorage {
  // ============================================
  // Catches
  // ============================================

  async saveCatch(catch_: OfflineCatch): Promise<void> {
    try {
      const catches = await this.getCatches();
      catches.push(catch_);
      await AsyncStorage.setItem(KEYS.CATCHES, JSON.stringify(catches));
    } catch (error) {
      console.error('Error saving catch offline:', error);
      throw error;
    }
  }

  async getCatches(): Promise<OfflineCatch[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CATCHES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting offline catches:', error);
      return [];
    }
  }

  async updateCatch(catchId: string, updates: Partial<OfflineCatch>): Promise<void> {
    try {
      const catches = await this.getCatches();
      const index = catches.findIndex((c) => c.id === catchId);
      if (index !== -1) {
        catches[index] = { ...catches[index], ...updates };
        await AsyncStorage.setItem(KEYS.CATCHES, JSON.stringify(catches));
      }
    } catch (error) {
      console.error('Error updating offline catch:', error);
      throw error;
    }
  }

  async deleteCatch(catchId: string): Promise<void> {
    try {
      const catches = await this.getCatches();
      const filtered = catches.filter((c) => c.id !== catchId);
      await AsyncStorage.setItem(KEYS.CATCHES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting offline catch:', error);
      throw error;
    }
  }

  async markCatchSynced(catchId: string): Promise<void> {
    try {
      const catches = await this.getCatches();
      const index = catches.findIndex((c) => c.id === catchId);
      if (index !== -1) {
        catches[index].synced = true;
        await AsyncStorage.setItem(KEYS.CATCHES, JSON.stringify(catches));
      }
    } catch (error) {
      console.error('Error marking catch as synced:', error);
    }
  }

  async clearSyncedCatches(): Promise<void> {
    try {
      const catches = await this.getCatches();
      const unsynced = catches.filter((c) => !c.synced);
      await AsyncStorage.setItem(KEYS.CATCHES, JSON.stringify(unsynced));
    } catch (error) {
      console.error('Error clearing synced catches:', error);
    }
  }

  // ============================================
  // Feed
  // ============================================

  async saveFeed(feed: FeedItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.FEED, JSON.stringify(feed));
    } catch (error) {
      console.error('Error saving feed offline:', error);
      throw error;
    }
  }

  async getFeed(): Promise<FeedItem[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.FEED);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting offline feed:', error);
      return [];
    }
  }

  async clearFeed(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.FEED);
    } catch (error) {
      console.error('Error clearing feed:', error);
    }
  }

  // ============================================
  // Sync Queue
  // ============================================

  async addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const newOp: SyncOperation = {
        ...operation,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        retries: 0,
      };
      queue.push(newOp);
      await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }

  async getSyncQueue(): Promise<SyncOperation[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  async removeFromSyncQueue(operationId: string): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const filtered = queue.filter((op) => op.id !== operationId);
      await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from sync queue:', error);
    }
  }

  async incrementRetryCount(operationId: string): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const index = queue.findIndex((op) => op.id === operationId);
      if (index !== -1) {
        queue[index].retries += 1;
        await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue));
      }
    } catch (error) {
      console.error('Error incrementing retry count:', error);
    }
  }

  async clearSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.SYNC_QUEUE);
    } catch (error) {
      console.error('Error clearing sync queue:', error);
    }
  }

  // ============================================
  // Last Sync
  // ============================================

  async setLastSyncTime(timestamp: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.LAST_SYNC, timestamp);
    } catch (error) {
      console.error('Error setting last sync time:', error);
    }
  }

  async getLastSyncTime(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  // ============================================
  // First Launch
  // ============================================

  async isFirstLaunch(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(KEYS.IS_FIRST_LAUNCH);
      return value === null; // null means first launch
    } catch (error) {
      console.error('Error checking first launch:', error);
      return false;
    }
  }

  async setNotFirstLaunch(): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.IS_FIRST_LAUNCH, 'false');
    } catch (error) {
      console.error('Error setting first launch flag:', error);
    }
  }

  // ============================================
  // Clear All
  // ============================================

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        KEYS.CATCHES,
        KEYS.FEED,
        KEYS.SYNC_QUEUE,
        KEYS.LAST_SYNC,
      ]);
    } catch (error) {
      console.error('Error clearing all offline data:', error);
    }
  }

  // ============================================
  // Debug/Stats
  // ============================================

  async getStorageStats(): Promise<{
    catches: number;
    feed: number;
    syncQueue: number;
    lastSync: string | null;
  }> {
    try {
      const [catches, feed, queue, lastSync] = await Promise.all([
        this.getCatches(),
        this.getFeed(),
        this.getSyncQueue(),
        this.getLastSyncTime(),
      ]);

      return {
        catches: catches.length,
        feed: feed.length,
        syncQueue: queue.length,
        lastSync,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        catches: 0,
        feed: 0,
        syncQueue: 0,
        lastSync: null,
      };
    }
  }
}

export const offlineStorage = new OfflineStorage();
