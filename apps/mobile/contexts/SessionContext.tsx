import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { api } from '../lib/api';

interface SessionState {
  id: string | null;
  sessionType: 'shore' | 'boat' | 'kayak' | 'ice' | 'wade';
  startTime: Date | null;
  strikes: number;
  catches: number;
  route: Array<{ lat: number; lng: number; timestamp: string; speed?: number }>;
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
  trackLocation: (location: { lat: number; lng: number; speed?: number }) => Promise<void>;
  refreshSession: () => Promise<void>;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'active_fishing_session';
const TRACK_INTERVAL_MS = 30000; // Track location every 30 seconds

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationTrackingInterval, setLocationTrackingInterval] = useState<NodeJS.Timeout | null>(null);

  const isActive = session !== null && session.id !== null;

  // Load session from AsyncStorage on mount
  useEffect(() => {
    loadSessionFromStorage();
  }, []);

  // Start location tracking when session is active
  useEffect(() => {
    if (isActive && session?.id) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => stopLocationTracking();
  }, [isActive, session?.id]);

  const loadSessionFromStorage = async () => {
    try {
      const storedSession = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        parsed.startTime = new Date(parsed.startTime);
        setSession(parsed);

        // Fetch latest session data from backend
        await refreshSession();
      }
    } catch (error) {
      console.error('Failed to load session from storage:', error);
    }
  };

  const saveSessionToStorage = async (sessionData: SessionState) => {
    try {
      await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to save session to storage:', error);
    }
  };

  const clearSessionFromStorage = async () => {
    try {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear session from storage:', error);
    }
  };

  const startSession = async (
    sessionType: 'shore' | 'boat' | 'kayak' | 'ice' | 'wade',
    title?: string
  ) => {
    setLoading(true);
    try {
      // Fetch weather data
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      let weatherData = null;
      try {
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m,surface_pressure&timezone=auto`
        );
        const weather = await weatherResponse.json();
        weatherData = {
          temperature: weather.current?.temperature_2m,
          windSpeed: weather.current?.wind_speed_10m ? weather.current.wind_speed_10m / 3.6 : undefined, // Convert km/h to m/s
          windDirection: weather.current?.wind_direction_10m
            ? getWindDirection(weather.current.wind_direction_10m)
            : undefined,
          pressure: weather.current?.surface_pressure,
        };
      } catch (error) {
        console.warn('Failed to fetch weather data:', error);
      }

      // Start session on backend
      const { data } = await api.post('/sessions/start', {
        sessionType,
        title: title || `${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} fisketur`,
        visibility: 'friends',
      });

      const newSession: SessionState = {
        id: data.session.id,
        sessionType,
        startTime: new Date(data.session.startTime),
        strikes: 0,
        catches: 0,
        route: [],
        weatherData,
      };

      setSession(newSession);
      await saveSessionToStorage(newSession);

      // Track initial location
      await trackLocation({
        lat: latitude,
        lng: longitude,
        speed: location.coords.speed || undefined,
      });
    } catch (error: any) {
      console.error('Failed to start session:', error);
      throw new Error(error.response?.data?.error || 'Kunne ikke starte session');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!session?.id) {
      console.log('❌ endSession: No active session');
      throw new Error('No active session');
    }

    console.log('🔄 endSession: Ending session', session.id);
    setLoading(true);
    try {
      const response = await api.post(`/sessions/${session.id}/end`, {
        weatherData: session.weatherData ? JSON.stringify(session.weatherData) : undefined,
      });
      console.log('✅ endSession: Session ended successfully', response.data);

      console.log('🗑️ endSession: Clearing session from storage');
      await clearSessionFromStorage();
      console.log('🛑 endSession: Stopping location tracking');
      stopLocationTracking();
      console.log('🔄 endSession: Setting session to null');
      setSession(null);
      console.log('✅ endSession: Complete');
    } catch (error: any) {
      console.error('❌ endSession: Failed to end session:', error);
      console.error('❌ endSession: Error response:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Kunne ikke afslutte session');
    } finally {
      setLoading(false);
    }
  };

  const addStrike = async () => {
    if (!session?.id) {
      throw new Error('No active session');
    }

    try {
      await api.patch(`/sessions/${session.id}/strike`);

      const updatedSession = {
        ...session,
        strikes: session.strikes + 1,
      };
      setSession(updatedSession);
      await saveSessionToStorage(updatedSession);
    } catch (error: any) {
      console.error('Failed to add strike:', error);
      throw new Error(error.response?.data?.error || 'Kunne ikke registrere hug');
    }
  };

  const trackLocation = async (location: { lat: number; lng: number; speed?: number }) => {
    if (!session?.id) return;

    try {
      await api.patch(`/sessions/${session.id}/track`, {
        lat: location.lat,
        lng: location.lng,
        timestamp: new Date().toISOString(),
        speed: location.speed,
      });

      const updatedSession = {
        ...session,
        route: [
          ...session.route,
          {
            lat: location.lat,
            lng: location.lng,
            timestamp: new Date().toISOString(),
            speed: location.speed,
          },
        ],
      };
      setSession(updatedSession);
      await saveSessionToStorage(updatedSession);
    } catch (error) {
      console.error('Failed to track location:', error);
    }
  };

  const refreshSession = async () => {
    if (!session?.id) return;

    try {
      const { data } = await api.get(`/sessions/${session.id}`);

      // If session has been ended on the backend, clear it locally
      if (data.endTime) {
        console.log('Session has been ended on backend, clearing local session');
        await clearSessionFromStorage();
        stopLocationTracking();
        setSession(null);
        return;
      }

      const updatedSession: SessionState = {
        id: data.id,
        sessionType: data.sessionType,
        startTime: new Date(data.startTime),
        strikes: session.strikes, // Keep local strike count
        catches: data.catchesCount || 0,
        route: data.route || session.route,
        weatherData: session.weatherData,
      };

      setSession(updatedSession);
      await saveSessionToStorage(updatedSession);
    } catch (error: any) {
      console.error('Failed to refresh session:', error);

      // If session not found on backend (404), clear local session
      if (error.response?.status === 404) {
        console.log('Session not found on backend, clearing local session');
        await clearSessionFromStorage();
        stopLocationTracking();
        setSession(null);
      }
    }
  };

  const startLocationTracking = () => {
    if (locationTrackingInterval) return;

    const interval = setInterval(async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        await trackLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          speed: location.coords.speed || undefined,
        });
      } catch (error) {
        console.error('Location tracking error:', error);
      }
    }, TRACK_INTERVAL_MS);

    setLocationTrackingInterval(interval);
  };

  const stopLocationTracking = () => {
    if (locationTrackingInterval) {
      clearInterval(locationTrackingInterval);
      setLocationTrackingInterval(null);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        isActive,
        startSession,
        endSession,
        addStrike,
        trackLocation,
        refreshSession,
        loading,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NØ', 'Ø', 'SØ', 'S', 'SV', 'V', 'NV'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}
