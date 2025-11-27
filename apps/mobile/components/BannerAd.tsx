import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useAdMob } from '../contexts/AdMobContext';
import { AdUnitIds } from '../constants/admob';

interface BannerAdProps {
  /**
   * Size of the banner ad
   * - BANNER: Standard banner (320x50)
   * - LARGE_BANNER: Large banner (320x100)
   * - MEDIUM_RECTANGLE: Medium rectangle (300x250) - best for feed
   * - FULL_BANNER: Full banner (468x60)
   * - LEADERBOARD: Leaderboard (728x90)
   */
  size?: BannerAdSize;
}

export default function BannerAdComponent({ size = BannerAdSize.BANNER }: BannerAdProps) {
  const { shouldShowAds, isInitialized } = useAdMob();

  // Don't render if user shouldn't see ads or AdMob isn't initialized
  if (!shouldShowAds || !isInitialized) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={AdUnitIds.banner}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
        }}
        onAdFailedToLoad={(error) => {
          console.error('Banner ad failed to load:', error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
});
