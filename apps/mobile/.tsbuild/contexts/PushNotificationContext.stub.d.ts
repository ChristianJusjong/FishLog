import React from 'react';
interface PushNotificationContextType {
    expoPushToken: string | null;
    notification: null;
}
export declare const usePushNotifications: () => PushNotificationContextType;
interface Props {
    children: React.ReactNode;
}
export declare function PushNotificationProvider({ children }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=PushNotificationContext.stub.d.ts.map