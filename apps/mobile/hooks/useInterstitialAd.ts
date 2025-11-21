import { useEffect, useState, useCallback } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { useAdMob } from '../contexts/AdMobContext';
import { AdUnitIds } from '../constants/admob';

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
export function useInterstitialAd() {
  const { shouldShowAds, isInitialized } = useAdMob();
  const [interstitial, setInterstitial] = useState<InterstitialAd | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!shouldShowAds || !isInitialized) {
      return;
    }

    // Create interstitial ad
    const ad = InterstitialAd.createForAdRequest(AdUnitIds.interstitial, {
      requestNonPersonalizedAdsOnly: false,
    });

    // Listen for ad loaded event
    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded');
      setLoaded(true);
    });

    // Listen for ad closed event
    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial ad closed');
      setLoaded(false);
      // Preload next ad
      ad.load();
    });

    // Listen for ad error event
    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Interstitial ad error:', error);
      setLoaded(false);
    });

    // Load the ad
    ad.load();
    setInterstitial(ad);

    // Cleanup
    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [shouldShowAds, isInitialized]);

  const show = useCallback(() => {
    if (loaded && interstitial) {
      interstitial.show();
      return true;
    }
    console.warn('Interstitial ad not loaded yet');
    return false;
  }, [loaded, interstitial]);

  return {
    show,
    loaded,
  };
}

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
export function useFrequencyCappedAd(frequency: number = 3) {
  const [actionCount, setActionCount] = useState(0);
  const { show, loaded } = useInterstitialAd();

  const showIfReady = useCallback(() => {
    const newCount = actionCount + 1;
    setActionCount(newCount);

    if (newCount >= frequency && loaded) {
      const shown = show();
      if (shown) {
        setActionCount(0); // Reset counter after showing ad
      }
    }
  }, [actionCount, frequency, loaded, show]);

  const reset = useCallback(() => {
    setActionCount(0);
  }, []);

  return {
    showIfReady,
    reset,
    actionCount,
    willShowNext: actionCount + 1 >= frequency && loaded,
  };
}
