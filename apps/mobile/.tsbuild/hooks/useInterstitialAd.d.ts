/**
 * Hook for managing interstitial ads
 *
 * Usage:
 * const { show, loaded } = useInterstitialAd();
 *
 * // Show ad when appropriate
 * if (loaded) {
 *   show();
 * }
 */
export declare function useInterstitialAd(): {
    show: () => boolean;
    loaded: boolean;
};
/**
 * Hook for frequency-capped interstitial ads
 * Shows ad every N actions
 *
 * Usage:
 * const { showIfReady } = useFrequencyCappedAd(3); // Show every 3 actions
 *
 * // Call this after each action
 * showIfReady();
 */
export declare function useFrequencyCappedAd(frequency?: number): {
    showIfReady: () => void;
    reset: () => void;
    actionCount: number;
    willShowNext: boolean;
};
//# sourceMappingURL=useInterstitialAd.d.ts.map