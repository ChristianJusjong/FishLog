import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Constants from 'expo-constants';
import { AuthProvider } from '../contexts/AuthContext';
import { WeatherLocationProvider } from '../contexts/WeatherLocationContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SessionProvider } from '../contexts/SessionContext';
// import { OfflineProvider } from '../contexts/OfflineContext'; // TODO: Create OfflineContext if needed
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { initDeepLinking } from '../lib/deepLinking';
// import GlobalAddCatchFAB from '../components/GlobalAddCatchFAB';

// Import appropriate PushNotificationProvider based on environment
// Expo Go (SDK 53+) removed push notification support, so use stub version
const isExpoGo = Constants.appOwnership === 'expo';
const PushNotificationModule = isExpoGo
  ? require('../contexts/PushNotificationContext.stub')
  : require('../contexts/PushNotificationContext');
const { PushNotificationProvider } = PushNotificationModule;

export default function RootLayout() {
  // Initialize deep linking
  useEffect(() => {
    const cleanup = initDeepLinking();
    return cleanup;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <SessionProvider>
              <WebSocketProvider>
                <PushNotificationProvider>
                  <WeatherLocationProvider>
                    <StatusBar style="auto" />
                    <Stack screenOptions={{ headerShown: false }} />
                    {/* Global Add Catch FAB - Temporarily disabled for testing */}
                    {/* <GlobalAddCatchFAB /> */}
                  </WeatherLocationProvider>
                </PushNotificationProvider>
              </WebSocketProvider>
            </SessionProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
