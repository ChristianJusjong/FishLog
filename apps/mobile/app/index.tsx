import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../contexts/AuthContext';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('===== INDEX SCREEN MOUNTED =====');

    if (!loading) {
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});

        if (user) {
          console.log('===== USER LOGGED IN, NAVIGATING TO FEED =====');
          router.replace('/feed');
        } else {
          console.log('===== NO USER, NAVIGATING TO LOGIN =====');
          router.replace('/login');
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Starting app...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
});
