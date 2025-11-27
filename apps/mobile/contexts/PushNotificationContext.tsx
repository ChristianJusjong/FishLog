import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';
import { useRouter } from 'expo-router';

// Configure notification behavior (only if not in Expo Go)
const isExpoGo = Constants.appOwnership === 'expo';
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

interface PushNotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
}

const PushNotificationContext = createContext<PushNotificationContextType>({
  expoPushToken: null,
  notification: null,
});

export const usePushNotifications = () => useContext(PushNotificationContext);

interface Props {
  children: React.ReactNode;
}

export function PushNotificationProvider({ children }: Props) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  /**
   * Register for push notifications and get Expo push token
   */
  async function registerForPushNotificationsAsync() {
    // Push notifications don't work in Expo Go (SDK 53+)
    if (isExpoGo) {
      return null;
    }

    if (!Device.isDevice) {
      return null;
    }

    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return null;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with your Expo project ID from app.json
      });

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3b82f6',
        });
      }

      return tokenData.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Send push token to backend
   */
  async function sendTokenToBackend(pushToken: string) {
    if (!token) return;

    try {
      const deviceInfo = {
        token: pushToken,
        device: `${Device.brand} ${Device.modelName}`,
      };

      await api.post('/push-tokens', deviceInfo, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    } catch (error) {
      console.error('Error sending push token to backend:', error);
    }
  }

  /**
   * Handle notification taps
   */
  function handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    // Navigate based on notification type
    if (data.type === 'new_like' || data.type === 'new_comment') {
      router.push(`/catch-detail?id=${data.catchId}`);
    } else if (data.type === 'new_message') {
      router.push('/messages');
    } else if (data.type === 'friend_request' || data.type === 'friend_request_accepted') {
      router.push('/friends');
    }
  }

  // Register for push notifications when user logs in
  useEffect(() => {
    if (user && token) {
      registerForPushNotificationsAsync().then((pushToken) => {
        if (pushToken) {
          setExpoPushToken(pushToken);
          sendTokenToBackend(pushToken);
        }
      });
    }
  }, [user, token]);

  // Set up notification listeners
  useEffect(() => {
    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const value: PushNotificationContextType = {
    expoPushToken,
    notification,
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
}
