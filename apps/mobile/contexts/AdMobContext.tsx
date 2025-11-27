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
  // Free users will see ads - this is the monetization strategy
  const shouldShowAds = !user?.premium;

  useEffect(() => {
    initializeAdMob();
  }, []);

  const initializeAdMob = async () => {
    try {
      // Initialize Google Mobile Ads SDK
      await mobileAds().initialize();

      // Configure ad settings
      await mobileAds().setRequestConfiguration({
        // Set content rating to general audiences (fishing is family-friendly)
        maxAdContentRating: MaxAdContentRating.G,

        // GDPR settings for EU/Denmark
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      });

      setIsInitialized(true);
    } catch (error) {
      console.error('❌ AdMob initialization failed:', error);
      // Still set initialized to true to prevent blocking the app
      setIsInitialized(true);
    }
  };

  return (
    <AdMobContext.Provider value={{ isInitialized, shouldShowAds }}>
      {children}
    </AdMobContext.Provider>
  );
};

export const useAdMob = () => {
  const context = useContext(AdMobContext);
  if (!context) {
    throw new Error('useAdMob must be used within AdMobProvider');
  }
  return context;
};
