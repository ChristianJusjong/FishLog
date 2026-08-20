import React, { ReactNode } from 'react';
interface WeatherData {
    temperature: number;
    windSpeed: number;
    description: string;
    icon: string;
}
interface WeatherLocationContextType {
    location: string;
    weather: WeatherData | null;
    unreadCount: number;
    loading: boolean;
    refreshWeatherLocation: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
}
export declare function WeatherLocationProvider({ children }: {
    children: ReactNode;
}): React.JSX.Element;
export declare function useWeatherLocation(): WeatherLocationContextType;
export {};
//# sourceMappingURL=WeatherLocationContext.d.ts.map