import React from 'react';
import * as Notifications from 'expo-notifications';
interface PushNotificationContextType {
    expoPushToken: string | null;
    notification: Notifications.Notification | null;
}
export declare const usePushNotifications: () => PushNotificationContextType;
interface Props {
    children: React.ReactNode;
}
export declare function PushNotificationProvider({ children }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=PushNotificationContext.d.ts.map