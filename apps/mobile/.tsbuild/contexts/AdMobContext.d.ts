import React from 'react';
interface AdMobContextType {
    isInitialized: boolean;
    shouldShowAds: boolean;
}
export declare const AdMobProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useAdMob: () => AdMobContextType;
export {};
//# sourceMappingURL=AdMobContext.d.ts.map