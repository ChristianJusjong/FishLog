import { Platform } from 'react-native';

// Google AdMob Test Ad Unit IDs
// Use these during development to avoid policy violations
const TEST_AD_UNITS = {
  banner: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
    default: 'ca-app-pub-3940256099942544/6300978111',
  })!,
  interstitial: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
    default: 'ca-app-pub-3940256099942544/1033173712',
  })!,
  rewarded: Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
    default: 'ca-app-pub-3940256099942544/5224354917',
  })!,
  // Note: Native ads require special setup
  nativeAdvanced: Platform.select({
    ios: 'ca-app-pub-3940256099942544/3986624511',
    android: 'ca-app-pub-3940256099942544/2247696110',
    default: 'ca-app-pub-3940256099942544/2247696110',
  })!,
};

// Production Ad Unit IDs
// TODO: Replace these with your actual AdMob ad unit IDs from Google AdMob console
const PRODUCTION_AD_UNITS = {
  banner: Platform.select({
    ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your iOS banner ID
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your Android banner ID
    default: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  })!,
  interstitial: Platform.select({
    ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your iOS interstitial ID
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your Android interstitial ID
    default: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  })!,
  rewarded: Platform.select({
    ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your iOS rewarded ID
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your Android rewarded ID
    default: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  })!,
  nativeAdvanced: Platform.select({
    ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your iOS native ID
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your Android native ID
    default: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  })!,
};

// Use test IDs in development, production IDs in production
const isDevelopment = __DEV__;

export const AdUnitIds = isDevelopment ? TEST_AD_UNITS : PRODUCTION_AD_UNITS;

// AdMob App IDs (set these in app.json)
export const ADMOB_APP_IDS = {
  ios: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX', // Replace with your iOS app ID
  android: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX', // Replace with your Android app ID
};
