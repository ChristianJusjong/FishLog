import React, { ReactNode } from 'react';
interface SessionState {
    id: string | null;
    sessionType: 'shore' | 'boat' | 'kayak' | 'ice' | 'wade';
    startTime: Date | null;
    strikes: number;
    catches: number;
    route: Array<{
        lat: number;
        lng: number;
        timestamp: string;
        speed?: number;
    }>;
    weatherData: {
        temperature?: number;
        waterTemperature?: number;
        windSpeed?: number;
        windDirection?: string;
        pressure?: number;
    } | null;
}
interface SessionContextType {
    session: SessionState | null;
    isActive: boolean;
    startSession: (sessionType: 'shore' | 'boat' | 'kayak' | 'ice' | 'wade', title?: string) => Promise<void>;
    endSession: () => Promise<void>;
    addStrike: () => Promise<void>;
    trackLocation: (location: {
        lat: number;
        lng: number;
        speed?: number;
    }) => Promise<void>;
    refreshSession: () => Promise<void>;
    loading: boolean;
}
export declare function SessionProvider({ children }: {
    children: ReactNode;
}): React.JSX.Element;
export declare function useSession(): SessionContextType;
export {};
//# sourceMappingURL=SessionContext.d.ts.map