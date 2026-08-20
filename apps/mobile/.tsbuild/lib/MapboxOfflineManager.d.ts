export declare class MapboxOfflineManager {
    static createOfflinePack(packName: string, bounds: [[number, number], [number, number]], minZoom?: number, maxZoom?: number, styleURL?: string): Promise<void>;
    static getOfflinePacks(): Promise<never[]>;
    static deleteOfflinePack(packName: string): Promise<void>;
}
//# sourceMappingURL=MapboxOfflineManager.d.ts.map