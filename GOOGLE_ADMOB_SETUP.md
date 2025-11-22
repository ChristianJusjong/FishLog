# Google AdMob Integration Guide

## Why Google AdMob?

✅ **No need to find advertisers** - Google handles everything
✅ **Automatic payments** - Direct deposit from Google
✅ **Smart targeting** - Google's algorithm optimizes ad delivery
✅ **Multiple ad formats** - Native, Banner, Interstitial, Rewarded
✅ **Analytics included** - Track revenue and performance
✅ **GDPR compliant** - Google handles consent management

Expected revenue: **$2-5 per 1000 active users/month** in Danish market

## Step 1: Install Google AdMob SDK

Since you're using Expo, you'll need to use a development build (managed workflow doesn't support AdMob):

```bash
# Install the official Google Mobile Ads SDK
npm install react-native-google-mobile-ads

# Create development build
npx expo prebuild
```

## Step 2: Configure AdMob

### Create AdMob Account
1. Go to [AdMob Console](https://apps.admob.com/)
2. Create account
3. Add your app (iOS + Android)
4. Get your **App ID**

### Update app.json

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
          "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
        }
      ]
    ]
  }
}
```

### iOS Configuration (ios/Podfile)
```ruby
platform :ios, '12.0'
```

### Android Configuration (android/app/src/main/AndroidManifest.xml)
```xml
<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"/>
```

## Step 3: Initialize AdMob

Create an AdMob initialization context:

**File**: `apps/mobile/contexts/AdMobContext.tsx`

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import { useAuth } from './AuthContext';

interface AdMobContextType {
  isInitialized: boolean;
  shouldShowAds: boolean;
}

const AdMobContext = createContext<AdMobContextType>({
  isInitialized: false,
  shouldShowAds: true,
});

export const AdMobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  // Don't show ads to premium users
  const shouldShowAds = user?.premium?.tier !== 'premium' && user?.premium?.tier !== 'pro';

  useEffect(() => {
    initializeAdMob();
  }, []);

  const initializeAdMob = async () => {
    try {
      await mobileAds().initialize();

      // Configure ad settings
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.G, // Family-friendly
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      });

      setIsInitialized(true);
      console.log('AdMob initialized successfully');
    } catch (error) {
      console.error('AdMob initialization failed:', error);
    }
  };

  return (
    <AdMobContext.Provider value={{ isInitialized, shouldShowAds }}>
      {children}
    </AdMobContext.Provider>
  );
};

export const useAdMob = () => useContext(AdMobContext);
```

## Step 4: Ad Unit IDs

Create ad units in AdMob console and store IDs:

**File**: `apps/mobile/constants/admob.ts`

```ts
import { Platform } from 'react-native';

// IMPORTANT: Replace with your actual AdMob IDs
const AD_UNIT_IDS = {
  // For testing during development
  TEST: {
    banner: Platform.select({
      ios: 'ca-app-pub-3940256099942544/2934735716',
      android: 'ca-app-pub-3940256099942544/6300978111',
    })!,
    nativeAdvanced: Platform.select({
      ios: 'ca-app-pub-3940256099942544/3986624511',
      android: 'ca-app-pub-3940256099942544/2247696110',
    })!,
    interstitial: Platform.select({
      ios: 'ca-app-pub-3940256099942544/4411468910',
      android: 'ca-app-pub-3940256099942544/1033173712',
    })!,
    rewarded: Platform.select({
      ios: 'ca-app-pub-3940256099942544/1712485313',
      android: 'ca-app-pub-3940256099942544/5224354917',
    })!,
  },

  // Production IDs - replace with your real IDs
  PRODUCTION: {
    banner: Platform.select({
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
      android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    })!,
    nativeAdvanced: Platform.select({
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
      android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    })!,
    interstitial: Platform.select({
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
      android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    })!,
    rewarded: Platform.select({
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
      android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    })!,
  },
};

// Use test IDs in development, production IDs in production
const isDevelopment = __DEV__;

export const AdUnitIds = isDevelopment ? AD_UNIT_IDS.TEST : AD_UNIT_IDS.PRODUCTION;
```

## Step 5: Native Ad Component (Feed)

Replace the custom NativeAdCard with Google's native ads:

**File**: `apps/mobile/components/GoogleNativeAd.tsx`

```tsx
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import NativeAdView, {
  HeadlineView,
  TaglineView,
  AdvertiserView,
  CallToActionView,
  ImageView,
  IconView,
  StarRatingView,
} from 'react-native-admob-native-ads';
import { useAdMob } from '../contexts/AdMobContext';
import { AdUnitIds } from '../constants/admob';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

export default function GoogleNativeAd() {
  const { shouldShowAds, isInitialized } = useAdMob();
  const { colors } = useTheme();

  if (!shouldShowAds || !isInitialized) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <NativeAdView
        adUnitID={AdUnitIds.nativeAdvanced}
        style={styles.adView}
      >
        {/* Sponsored badge */}
        <View style={styles.sponsoredBadge}>
          <AdvertiserView
            style={[styles.advertiser, { color: colors.textSecondary }]}
          />
        </View>

        {/* Ad content */}
        <View style={styles.content}>
          {/* Icon */}
          <IconView style={styles.icon} />

          {/* Text content */}
          <View style={styles.textContainer}>
            <HeadlineView
              style={[styles.headline, { color: colors.text }]}
              numberOfLines={2}
            />
            <TaglineView
              style={[styles.tagline, { color: colors.textSecondary }]}
              numberOfLines={2}
            />
            <StarRatingView style={styles.stars} />
          </View>
        </View>

        {/* Image */}
        <ImageView style={styles.image} />

        {/* Call to action */}
        <CallToActionView
          style={[styles.ctaButton, { backgroundColor: colors.primary }]}
          textStyle={styles.ctaText}
          allCaps
        />
      </NativeAdView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  adView: {
    width: '100%',
  },
  sponsoredBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  advertiser: {
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  headline: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 14,
  },
  stars: {
    width: 80,
    height: 15,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: SPACING.md,
  },
  ctaButton: {
    margin: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
```

## Step 6: Banner Ad Component (Statistics/Map)

**File**: `apps/mobile/components/BannerAd.tsx`

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useAdMob } from '../contexts/AdMobContext';
import { AdUnitIds } from '../constants/admob';

interface BannerAdProps {
  size?: BannerAdSize;
}

export default function BannerAdComponent({ size = BannerAdSize.BANNER }: BannerAdProps) {
  const { shouldShowAds, isInitialized } = useAdMob();

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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
});
```

## Step 7: Interstitial Ad (Between Sessions)

**File**: `apps/mobile/hooks/useInterstitialAd.ts`

```tsx
import { useEffect, useState } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { useAdMob } from '../contexts/AdMobContext';
import { AdUnitIds } from '../constants/admob';

export function useInterstitialAd() {
  const { shouldShowAds, isInitialized } = useAdMob();
  const [interstitial, setInterstitial] = useState<InterstitialAd | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!shouldShowAds || !isInitialized) return;

    const ad = InterstitialAd.createForAdRequest(AdUnitIds.interstitial);

    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
    });

    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      ad.load(); // Load next ad
    });

    ad.load();
    setInterstitial(ad);

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, [shouldShowAds, isInitialized]);

  const show = () => {
    if (loaded && interstitial) {
      interstitial.show();
    }
  };

  return { show, loaded };
}
```

**Usage in Session End**:
```tsx
import { useInterstitialAd } from '../hooks/useInterstitialAd';

function SessionScreen() {
  const { show: showInterstitial } = useInterstitialAd();

  const handleEndSession = async () => {
    // Save session
    await saveSession();

    // Show ad every 3 sessions
    if (sessionCount % 3 === 0) {
      showInterstitial();
    }

    router.push('/feed');
  };

  return (
    <Button onPress={handleEndSession}>End Session</Button>
  );
}
```

## Step 8: Integrate into App

### Update _layout.tsx

```tsx
import { AdMobProvider } from '../contexts/AdMobContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdMobProvider>
          <Stack />
        </AdMobProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### Add to Feed

```tsx
import GoogleNativeAd from '../components/GoogleNativeAd';

function FeedScreen() {
  return (
    <FlatList
      data={posts}
      renderItem={({ item, index }) => {
        // Show native ad every 5 posts
        if (index % 5 === 4) {
          return (
            <>
              <FeedPost post={item} />
              <GoogleNativeAd />
            </>
          );
        }
        return <FeedPost post={item} />;
      }}
    />
  );
}
```

### Add to Statistics

```tsx
import BannerAd from '../components/BannerAd';
import { BannerAdSize } from 'react-native-google-mobile-ads';

function StatisticsScreen() {
  return (
    <ScrollView>
      <WeatherLocationCard />

      {/* Stats content */}
      <StatsGrid />

      {/* Banner ad */}
      <BannerAd size={BannerAdSize.MEDIUM_RECTANGLE} />

      {/* More content */}
      <Charts />
    </ScrollView>
  );
}
```

## Step 9: Premium Users = No Ads

The `AdMobContext` already checks premium status:

```tsx
const shouldShowAds = user?.premium?.tier !== 'premium' && user?.premium?.tier !== 'pro';
```

All ad components automatically hide for premium users!

## Step 10: Build & Deploy

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios

# Production builds
eas build --platform android
eas build --platform ios
```

## Revenue Expectations (Danish Market)

### AdMob Rates
- **eCPM (effective CPM)**: $1-3 (7-20 kr)
- **Banner ads**: $0.50-1 CPM
- **Native ads**: $2-4 CPM
- **Interstitial**: $3-5 CPM

### Projected Revenue

**10,000 Daily Active Users**:
- ~50,000 ad impressions/day
- ~1.5M impressions/month
- Revenue: **$1,500-4,500/month** (10,000-30,000 kr)

**50,000 Daily Active Users**:
- ~250,000 ad impressions/day
- ~7.5M impressions/month
- Revenue: **$7,500-22,500/month** (50,000-150,000 kr)

## Best Practices

### Ad Placement
✅ **Feed**: Native ad every 5 posts
✅ **Statistics**: Banner at bottom
✅ **Map**: Small banner below controls
✅ **Session End**: Interstitial every 3 sessions
❌ **Don't**: Show ads during active fishing session
❌ **Don't**: Show ads on login/signup screens

### Frequency Capping
```tsx
// Example: Limit interstitials
let sessionCount = 0;
const MIN_SESSION_INTERVAL = 3;

function showAdIfNeeded() {
  sessionCount++;
  if (sessionCount >= MIN_SESSION_INTERVAL) {
    showInterstitial();
    sessionCount = 0;
  }
}
```

### Test Mode
Always use test ad units during development:
```tsx
const isDevelopment = __DEV__;
export const AdUnitIds = isDevelopment ? TEST_IDS : PRODUCTION_IDS;
```

## GDPR Compliance (EU/Denmark)

Google AdMob handles GDPR automatically, but you should:

1. **Add consent flow** (for first app launch)
2. **Update privacy policy** with AdMob data usage
3. **Provide opt-out** via premium subscription

```tsx
import { AdsConsent } from 'react-native-google-mobile-ads';

const consentInfo = await AdsConsent.requestInfoUpdate();
if (consentInfo.isConsentFormAvailable) {
  await AdsConsent.showForm();
}
```

## Summary

✅ No need to manage advertisers
✅ Google handles payments automatically
✅ Smart optimization increases revenue
✅ Premium users see no ads
✅ Expected: 10,000-30,000 kr/month @ 10k users

**Next Step**: Create AdMob account and get your App IDs!
