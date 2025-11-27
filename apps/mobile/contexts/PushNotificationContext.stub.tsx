import React, { createContext, useContext } from 'react';

// Stub version for Expo Go (no push notifications)
interface PushNotificationContextType {
  expoPushToken: string | null;
  notification: null;
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
  const value: PushNotificationContextType = {
    expoPushToken: null,
    notification: null,
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
}
