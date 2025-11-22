# Google AdMob Implementation - Complete Setup

## ✅ What's Been Implemented

I've set up Google AdMob integration for your FishLog app. This means **Google handles all advertiser relationships, payments, and optimization** - you just need to create an AdMob account and add your ad placements.

### Files Created

1. **`apps/mobile/constants/admob.ts`**
   - Ad unit IDs configuration
   - Uses test IDs in development, production IDs when deployed
   - Platform-specific (iOS/Android) ad unit management

2. **`apps/mobile/contexts/AdMobContext.tsx`**
   - Initializes Google AdMob SDK
   - Manages ad visibility (premium users see NO ads)
   - Handles GDPR-compliant settings

3. **`apps/mobile/components/BannerAd.tsx`**
   - Reusable banner ad component
   - Multiple sizes supported (standard, large, medium rectangle)
   - Auto-hides for premium users

4. **`apps/mobile/hooks/useInterstitialAd.ts`**
   - Hook for full-screen interstitial ads
   - Frequency capping support (show every N actions)
   - Auto-preloading for smooth experience

5. **Updated `apps/mobile/app.json`**
   - Added AdMob plugin configuration
   - Test AdMob app IDs configured (replace with yours later)

6. **`GOOGLE_ADMOB_SETUP.md`**
   - Complete implementation guide
   - Revenue projections
   - Best practices
   - GDPR compliance info

## 🚀 Next Steps to Go Live

### Step 1: Create AdMob Account (10 minutes)

1. Go to https://admob.google.com/
2. Sign up with your Google account
3. Create a new app:
   - **App name**: Hook (FishLog)
   - **Platform**: iOS & Android
   - **Store presence**: Not published yet (select this option)

### Step 2: Get Your Ad Unit IDs (5 minutes)

In AdMob console, create these ad units:

**For iOS**:
- Banner ad unit
- Interstitial ad unit
- Rewarded ad unit (optional)

**For Android**:
- Banner ad unit
- Interstitial ad unit
- Rewarded ad unit (optional)

Copy all the IDs (format: `ca-app-pub-XXXXXXXX/YYYYYYYYYY`)

### Step 3: Update Configuration (2 minutes)

**File**: `apps/mobile/constants/admob.ts`

Replace the production IDs with your real IDs:

```typescript
const PRODUCTION_AD_UNITS = {
  banner: Platform.select({
    ios: 'ca-app-pub-XXXXXXXX/YYYYYYYYYY', // Your iOS banner ID
    android: 'ca-app-pub-XXXXXXXX/YYYYYYYYYY', // Your Android banner ID
  })!,
  interstitial: Platform.select({
    ios: 'ca-app-pub-XXXXXXXX/YYYYYYYYYY', // Your iOS interstitial ID
    android: 'ca-app-pub-XXXXXXXX/YYYYYYYYYY', // Your Android interstitial ID
  })!,
};
```

**File**: `apps/mobile/app.json`

Replace test app IDs with your real app IDs:

```json
{
  "plugins": [
    [
      "react-native-google-mobile-ads",
      {
        "androidAppId": "ca-app-pub-XXXXXXXX~YYYYYYYYYY",
        "iosAppId": "ca-app-pub-XXXXXXXX~YYYYYYYYYY"
      }
    ]
  ]
}
```

### Step 4: Add AdMobProvider to App (1 minute)

**File**: `apps/mobile/app/_layout.tsx`

```tsx
import { AdMobProvider } from '../contexts/AdMobContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdMobProvider>  {/* Add this */}
          <Stack>
            {/* Your routes */}
          </Stack>
        </AdMobProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### Step 5: Add Ads to Your Screens

#### Statistics Screen
**File**: `apps/mobile/app/statistics.tsx`

```tsx
import BannerAd from '../components/BannerAd';
import { BannerAdSize } from 'react-native-google-mobile-ads';

// Add at the bottom of your ScrollView
<ScrollView>
  {/* Your existing content */}
  <StatsGrid />
  <Charts />

  {/* Add banner ad */}
  <BannerAd size={BannerAdSize.MEDIUM_RECTANGLE} />
</ScrollView>
```

#### Map Screen (Optional)
**File**: `apps/mobile/app/map.tsx`

```tsx
import BannerAd from '../components/BannerAd';
import { BannerAdSize } from 'react-native-google-mobile-ads';

// Add small banner at bottom
<View style={styles.container}>
  <MapView />
  <BannerAd size={BannerAdSize.BANNER} />
</View>
```

#### After Fishing Sessions (Best placement!)
**File**: Wherever you end fishing sessions

```tsx
import { useFrequencyCappedAd } from '../hooks/useInterstitialAd';

function SessionScreen() {
  // Show interstitial every 3 sessions
  const { showIfReady } = useFrequencyCappedAd(3);

  const handleEndSession = async () => {
    await saveSession();

    // Show ad if it's time
    showIfReady();

    router.push('/feed');
  };

  return (
    <Button onPress={handleEndSession}>Afslut Session</Button>
  );
}
```

### Step 6: Build Native App (Required for AdMob)

AdMob requires native code, so you need to create a development build:

```bash
# One-time setup
cd apps/mobile
npx expo prebuild

# Build for Android
npx expo run:android

# Build for iOS (Mac only)
npx expo run:ios
```

**OR** use EAS Build for both platforms:

```bash
eas build --platform android
eas build --platform ios
```

## 💰 Revenue Expectations (Danish Market)

### AdMob Rates in Denmark
- **Banner ads**: $0.50-1.50 CPM (4-10 kr per 1000 impressions)
- **Interstitial ads**: $2-5 CPM (14-35 kr per 1000 impressions)
- **Rewarded ads**: $5-10 CPM (35-70 kr per 1000 impressions)

### Conservative Revenue Projections

**1,000 Daily Active Users**:
- ~5,000 banner impressions/day
- ~500 interstitial impressions/day
- **Revenue: ~€100-200/month** (~700-1,400 kr/month)

**10,000 Daily Active Users**:
- ~50,000 banner impressions/day
- ~5,000 interstitial impressions/day
- **Revenue: ~€1,000-2,000/month** (~7,000-14,000 kr/month)

**50,000 Daily Active Users**:
- ~250,000 banner impressions/day
- ~25,000 interstitial impressions/day
- **Revenue: ~€5,000-10,000/month** (~35,000-70,000 kr/month)

### How Google Pays You

- **Payment method**: Bank transfer (direct deposit)
- **Payment threshold**: €100 (you get paid when you reach €100)
- **Payment schedule**: Monthly (around the 21st)
- **No invoice needed**: Google handles all advertiser billing

## 🎯 Ad Placement Strategy (Best Practices)

### ✅ Good Placements

1. **Statistics screen** - Natural break, user is browsing
2. **Between fishing sessions** - User finished activity
3. **After viewing leaderboards** - Low-friction moment
4. **In settings** - User is already in non-critical flow

### ❌ Bad Placements

1. **During active fishing session** - Interrupts core experience
2. **Login/signup screens** - Hurts conversion
3. **Loading screens** - Poor UX
4. **Error screens** - Frustrating

### Frequency Guidelines

- **Banner ads**: Can be persistent (always visible)
- **Interstitial ads**: Maximum 1 per 5 minutes
- **Suggested**: Show interstitial every 3-5 sessions

## 🔒 Premium Users = Ad-Free

The system automatically hides ALL ads for premium/pro users:

```tsx
// In AdMobContext.tsx
const shouldShowAds = !user?.premium ||
  (user.premium.tier !== 'premium' && user.premium.tier !== 'pro');
```

This creates a **strong incentive** for users to upgrade:
- Free users: See ads, full features
- Premium (50-99kr/month): No ads + advanced analytics
- Pro (199kr/month): No ads + all features

## 📊 Monitoring Performance

### AdMob Dashboard
Track in real-time:
- Impressions & clicks
- Revenue (today, this week, this month)
- eCPM (effective cost per thousand impressions)
- Fill rate (how often ads are shown successfully)

### Optimize Revenue
1. **Test different ad sizes** - Medium rectangle often performs best
2. **Adjust frequency** - Too many ads = bad UX, too few = lost revenue
3. **Watch fill rate** - If low, add more ad units as backup
4. **A/B test placements** - Track which screens generate most revenue

## 🚨 Important Notes

### Development vs Production

The current setup uses **test ad units** in development:
- ✅ Safe for testing (won't get banned)
- ✅ Shows sample ads
- ❌ Doesn't generate real revenue

In production (after `__DEV__ = false`):
- ✅ Shows real ads
- ✅ Generates real revenue
- ⚠️ Must use your real ad unit IDs

### Policy Compliance

**Do NOT**:
- Click your own ads (ban risk!)
- Ask users to click ads
- Place ads near buttons to cause accidental clicks
- Show ads on error/crash screens

**Do**:
- Use clear ad labels (Google adds "Ad" badge automatically)
- Test with test ad units
- Monitor your AdMob policy center
- Update privacy policy to mention ads

### GDPR (Denmark/EU)

Google AdMob handles GDPR consent automatically:
- Shows consent dialog on first launch (EU users)
- Respects user choices
- Updates privacy policy: Add "This app uses Google AdMob for advertising"

## 📋 Quick Start Checklist

- [ ] Create AdMob account
- [ ] Create ad units (iOS + Android)
- [ ] Update `apps/mobile/constants/admob.ts` with real IDs
- [ ] Update `apps/mobile/app.json` with real app IDs
- [ ] Add `<AdMobProvider>` to _layout.tsx
- [ ] Add `<BannerAd />` to statistics screen
- [ ] Add interstitial to session end flow
- [ ] Run `npx expo prebuild`
- [ ] Test on real device
- [ ] Deploy to App Store & Play Store
- [ ] Monitor AdMob dashboard
- [ ] Update privacy policy

## 🎉 Summary

You now have a complete Google AdMob integration that:

✅ **Automatically manages ads** - Google finds advertisers
✅ **No manual ad deals needed** - Everything is automated
✅ **Respects premium users** - They see no ads
✅ **Generates passive revenue** - Money while you sleep
✅ **GDPR compliant** - Google handles EU consent
✅ **Easy to monitor** - Real-time dashboard

**Expected revenue**: 7,000-14,000 kr/month at 10k users!

Just create your AdMob account, get your IDs, and you're ready to monetize! 🚀
