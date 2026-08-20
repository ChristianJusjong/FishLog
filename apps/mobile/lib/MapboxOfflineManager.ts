export class MapboxOfflineManager {
  static async createOfflinePack(
    packName: string,
    bounds: [[number, number], [number, number]],
    minZoom: number = 10,
    maxZoom: number = 16,
    styleURL: string = ''
  ) {
    console.log(`[Mapbox Offline Mock] Cannot create pack ${packName}. Mapbox is uninstalled.`);
  }

  static async getOfflinePacks() {
    return [];
  }

  static async deleteOfflinePack(packName: string) {
    console.log(`[Mapbox Offline Mock] Cannot delete pack ${packName}. Mapbox is uninstalled.`);
  }
}
