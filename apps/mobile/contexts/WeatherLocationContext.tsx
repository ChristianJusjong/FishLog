import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fishlog-production.up.railway.app';

// Cache duration: 15 minutes
const CACHE_DURATION = 15 * 60 * 1000;

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

const WeatherLocationContext = createContext<WeatherLocationContextType | undefined>(undefined);

export function WeatherLocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<string>('Henter placering...');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
    }
  }, []);

  const getCurrentLocationAndWeather = useCallback(async (force = false) => {
    const now = Date.now();

    // Check if we should skip fetching (data is still fresh)
    if (!force && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
      return;
    }

    setLoading(true);
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation('Placering ikke tilgængelig');
        setLoading(false);
        return;
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = position.coords;

      // Get location name using reverse geocoding
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode.length > 0) {
        const address = geocode[0];
        const city = address.city || address.subregion || address.region;
        setLocation(city || 'Ukendt placering');
      }

      // Fetch weather data from Open-Meteo (free, no API key required)
      try {
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto`
        );

        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json();

          // Map WMO weather codes to icon names
          const getWeatherIcon = (code: number): string => {
            if (code === 0) return 'Clear';
            if (code <= 3) return 'Clouds';
            if (code >= 51 && code <= 67) return 'Rain';
            if (code >= 71 && code <= 77) return 'Snow';
            if (code >= 80 && code <= 82) return 'Rain';
            if (code >= 95) return 'Thunderstorm';
            return 'Clouds';
          };

          // Map WMO weather codes to Danish descriptions
          const getWeatherDescription = (code: number): string => {
            if (code === 0) return 'Klart vejr';
            if (code === 1) return 'Hovedsageligt klart';
            if (code === 2) return 'Delvist skyet';
            if (code === 3) return 'Overskyet';
            if (code >= 51 && code <= 55) return 'Støvregn';
            if (code >= 61 && code <= 65) return 'Regn';
            if (code >= 71 && code <= 75) return 'Sne';
            if (code >= 80 && code <= 82) return 'Regnbyger';
            if (code >= 95) return 'Tordenvejr';
            return 'Skyet';
          };

          const weatherCode = weatherData.current.weather_code;
          const temp = Math.round(weatherData.current.temperature_2m);
          // Convert wind speed from km/h to m/s (divide by 3.6)
          const wind = Math.round(weatherData.current.wind_speed_10m / 3.6);
          const description = getWeatherDescription(weatherCode);
          const icon = getWeatherIcon(weatherCode);

          setWeather({
            temperature: temp,
            windSpeed: wind,
            description: description,
            icon: icon,
          });
        } else {
          throw new Error('Weather API request failed');
        }
      } catch (weatherError) {
        console.error('Failed to fetch weather data:', weatherError);
        // Fallback to placeholder data
        setWeather({
          temperature: 15,
          windSpeed: 3,
          description: 'Vejrdata ikke tilgængelig',
          icon: 'Clouds',
        });
      }

      // Update last fetch time
      setLastFetchTime(now);
    } catch (error) {
      console.error('Error getting location/weather:', error);
      setLocation('København'); // Fallback
      setWeather({
        temperature: 18,
        windSpeed: 5,
        description: 'Delvist skyet',
        icon: 'Clouds',
      });
    } finally {
      setLoading(false);
    }
  }, [lastFetchTime]);

  // Initial fetch on mount
  useEffect(() => {
    getCurrentLocationAndWeather();
    fetchUnreadNotifications();
  }, []);

  const refreshWeatherLocation = useCallback(async () => {
    await getCurrentLocationAndWeather(true);
  }, [getCurrentLocationAndWeather]);

  const refreshNotifications = useCallback(async () => {
    await fetchUnreadNotifications();
  }, [fetchUnreadNotifications]);

  return (
    <WeatherLocationContext.Provider
      value={{
        location,
        weather,
        unreadCount,
        loading,
        refreshWeatherLocation,
        refreshNotifications,
      }}
    >
      {children}
    </WeatherLocationContext.Provider>
  );
}

export function useWeatherLocation() {
  const context = useContext(WeatherLocationContext);
  if (context === undefined) {
    throw new Error('useWeatherLocation must be used within a WeatherLocationProvider');
  }
  return context;
}
