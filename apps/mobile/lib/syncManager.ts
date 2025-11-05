import NetInfo from '@react-native-community/netinfo';
import { api } from './api';
import { offlineStorage, SyncOperation, OfflineCatch } from './offlineStorage';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

class SyncManager {
  private isSyncing = false;
  private listeners: Array<(status: SyncStatus, result?: SyncResult) => void> = [];

  /**
   * Subscribe to sync status changes
   */
  onSyncStatusChange(callback: (status: SyncStatus, result?: SyncResult) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners(status: SyncStatus, result?: SyncResult) {
    this.listeners.forEach((listener) => listener(status, result));
  }

  /**
   * Check if device is online
   */
  async isOnline(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected === true && state.isInternetReachable !== false;
    } catch (error) {
      console.error('Error checking network status:', error);
      return false;
    }
  }

  /**
   * Start background sync listener
   */
  startAutoSync() {
    // Listen for network changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected === true && state.isInternetReachable !== false;

      if (isConnected && !this.isSyncing) {
        console.log('Network connected - starting sync');
        this.syncAll();
      }
    });

    return unsubscribe;
  }

  /**
   * Sync all pending operations
   */
  async syncAll(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return { success: false, synced: 0, failed: 0, errors: ['Sync already in progress'] };
    }

    // Check if online
    const online = await this.isOnline();
    if (!online) {
      console.log('Device is offline - skipping sync');
      return { success: false, synced: 0, failed: 0, errors: ['Device is offline'] };
    }

    this.isSyncing = true;
    this.notifyListeners('syncing');

    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Get sync queue
      const queue = await offlineStorage.getSyncQueue();
      console.log(`Starting sync: ${queue.length} operations in queue`);

      // Process each operation
      for (const operation of queue) {
        try {
          await this.processOperation(operation);
          await offlineStorage.removeFromSyncQueue(operation.id);
          result.synced++;
        } catch (error: any) {
          console.error(`Failed to sync operation ${operation.id}:`, error);
          result.failed++;
          result.errors.push(error.message || 'Unknown error');

          // Increment retry count
          await offlineStorage.incrementRetryCount(operation.id);

          // Remove if too many retries
          if (operation.retries >= 3) {
            console.log(`Removing operation ${operation.id} after 3 failed attempts`);
            await offlineStorage.removeFromSyncQueue(operation.id);
          }
        }
      }

      // Clear synced catches from offline storage
      await offlineStorage.clearSyncedCatches();

      // Update last sync time
      await offlineStorage.setLastSyncTime(new Date().toISOString());

      // Mark as successful if at least one operation synced
      result.success = result.synced > 0 || queue.length === 0;

      console.log(`Sync complete: ${result.synced} synced, ${result.failed} failed`);
      this.notifyListeners(result.failed > 0 ? 'error' : 'success', result);

      return result;
    } catch (error: any) {
      console.error('Sync error:', error);
      result.success = false;
      result.errors.push(error.message || 'Unknown sync error');
      this.notifyListeners('error', result);
      return result;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process a single sync operation
   */
  private async processOperation(operation: SyncOperation): Promise<void> {
    console.log(`Processing operation: ${operation.type}`);

    switch (operation.type) {
      case 'create_catch':
        await this.syncCreateCatch(operation.data);
        break;

      case 'update_catch':
        await this.syncUpdateCatch(operation.data);
        break;

      case 'delete_catch':
        await this.syncDeleteCatch(operation.data);
        break;

      case 'like_catch':
        await this.syncLikeCatch(operation.data);
        break;

      case 'comment_catch':
        await this.syncCommentCatch(operation.data);
        break;

      default:
        console.warn(`Unknown operation type: ${operation.type}`);
    }
  }

  /**
   * Sync create catch operation
   */
  private async syncCreateCatch(data: OfflineCatch): Promise<void> {
    try {
      const response = await api.post('/catches', {
        species: data.species,
        lengthCm: data.lengthCm,
        weightKg: data.weightKg,
        bait: data.bait,
        lure: data.lure,
        rig: data.rig,
        technique: data.technique,
        notes: data.notes,
        latitude: data.latitude,
        longitude: data.longitude,
        photoUrl: data.photoUrl,
        visibility: data.visibility || 'private',
      });

      // Mark catch as synced
      await offlineStorage.markCatchSynced(data.id);

      console.log(`Catch ${data.id} synced successfully`);
    } catch (error) {
      console.error('Error syncing create catch:', error);
      throw error;
    }
  }

  /**
   * Sync update catch operation
   */
  private async syncUpdateCatch(data: { id: string; updates: Partial<OfflineCatch> }): Promise<void> {
    try {
      await api.put(`/catches/${data.id}`, data.updates);
      console.log(`Catch ${data.id} update synced successfully`);
    } catch (error) {
      console.error('Error syncing update catch:', error);
      throw error;
    }
  }

  /**
   * Sync delete catch operation
   */
  private async syncDeleteCatch(data: { id: string }): Promise<void> {
    try {
      await api.delete(`/catches/${data.id}`);
      await offlineStorage.deleteCatch(data.id);
      console.log(`Catch ${data.id} deletion synced successfully`);
    } catch (error) {
      console.error('Error syncing delete catch:', error);
      throw error;
    }
  }

  /**
   * Sync like catch operation
   */
  private async syncLikeCatch(data: { catchId: string }): Promise<void> {
    try {
      await api.post(`/catches/${data.catchId}/like`);
      console.log(`Like on catch ${data.catchId} synced successfully`);
    } catch (error) {
      console.error('Error syncing like catch:', error);
      throw error;
    }
  }

  /**
   * Sync comment catch operation
   */
  private async syncCommentCatch(data: { catchId: string; text: string }): Promise<void> {
    try {
      await api.post(`/catches/${data.catchId}/comments`, { text: data.text });
      console.log(`Comment on catch ${data.catchId} synced successfully`);
    } catch (error) {
      console.error('Error syncing comment catch:', error);
      throw error;
    }
  }

  /**
   * Force sync now (manual trigger)
   */
  async forceSyncNow(): Promise<SyncResult> {
    console.log('Force sync triggered');
    return await this.syncAll();
  }

  /**
   * Get sync status
   */
  getSyncStatus(): boolean {
    return this.isSyncing;
  }
}

export const syncManager = new SyncManager();
