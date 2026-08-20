import React from 'react';
import { BannerAdSize } from 'react-native-google-mobile-ads';
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
export default function BannerAdComponent({ size }: BannerAdProps): React.JSX.Element | null;
export {};
//# sourceMappingURL=BannerAd.d.ts.map