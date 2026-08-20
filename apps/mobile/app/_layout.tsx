import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Constants from 'expo-constants';
import { AuthProvider } from '../contexts/AuthContext';
import { WeatherLocationProvider } from '../contexts/WeatherLocationContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NavConfigProvider } from '../contexts/NavConfigContext';
import { TackleBoxProvider } from '../contexts/TackleBoxContext';
import { SessionProvider } from '../contexts/SessionContext';
import { OfflineProvider } from '../contexts/OfflineContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { initDeepLinking } from '../lib/deepLinking';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OfflineBanner from '../components/OfflineBanner';
import CustomizeNavModal from '../components/CustomizeNavModal';
import AppPreloader from '../components/AppPreloader';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});


// Import appropriate PushNotificationProvider based on environment
// Expo Go (SDK 53+) removed push notification support, so use stub version
const isExpoGo = Constants.appOwnership === 'expo';
const PushNotificationModule = isExpoGo
  ? require('../contexts/PushNotificationContext.stub')
  : require('../contexts/PushNotificationContext');
const { PushNotificationProvider } = PushNotificationModule;

export default function RootLayout() {
  const [isPreloaded, setIsPreloaded] = useState(false);

  // Initialize deep linking
  useEffect(() => {
    const cleanup = initDeepLinking();
    return cleanup;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <NavConfigProvider>
                <TackleBoxProvider>
                  <OfflineProvider>
                    <SessionProvider>
                      <WebSocketProvider>
                        <PushNotificationProvider>
                          <WeatherLocationProvider>
                            <StatusBar style="auto" />
                            <OfflineBanner />
                            <Stack
                              screenOptions={{
                                headerShown: false,
                                animation: 'slide_from_right',
                                animationDuration: 220,
                              }}
                            />
                            <CustomizeNavModal />
                            {!isPreloaded && (
                              <AppPreloader onComplete={() => setIsPreloaded(true)} />
                            )}
                          </WeatherLocationProvider>
                        </PushNotificationProvider>
                      </WebSocketProvider>
                    </SessionProvider>
                  </OfflineProvider>
                </TackleBoxProvider>
              </NavConfigProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
