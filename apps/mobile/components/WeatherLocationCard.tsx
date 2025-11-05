import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/branding';

interface WeatherData {
  temperature: number;
  windSpeed: number;
  description: string;
  icon: string;
}

interface WeatherLocationCardProps {
  showLocation?: boolean;
  showWeather?: boolean;
}

export default function WeatherLocationCard({
  showLocation = true,
  showWeather = true
}: WeatherLocationCardProps) {
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState<string>('Henter placering...');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentLocationAndWeather();
  }, []);

  const getCurrentLocationAndWeather = async () => {
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

          console.log('Open-Meteo API response:', {
            temp: weatherData.current.temperature_2m,
            wind: weatherData.current.wind_speed_10m,
            code: weatherData.current.weather_code,
          });

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
          const wind = Math.round(weatherData.current.wind_speed_10m);
          const description = getWeatherDescription(weatherCode);
          const icon = getWeatherIcon(weatherCode);

          console.log('Processed weather:', { temp, wind, description, icon });

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
  };

  const getWeatherIcon = (iconName: string): keyof typeof Ionicons.glyphMap => {
    switch (iconName) {
      case 'Clear':
        return 'sunny';
      case 'Clouds':
        return 'cloudy';
      case 'Rain':
      case 'Drizzle':
        return 'rainy';
      case 'Thunderstorm':
        return 'thunderstorm';
      case 'Snow':
        return 'snow';
      default:
        return 'partly-sunny';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top, SPACING.sm) }]}>
        <ActivityIndicator size="small" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, SPACING.sm) }]}>
      {/* Weather Section (Left) */}
      {showWeather && weather && (
        <View style={styles.weatherSection}>
          <View style={styles.weatherRow}>
            <Ionicons
              name={getWeatherIcon(weather.icon)}
              size={24}
              color="#FFFFFF"
              style={styles.weatherIcon}
            />
            <Text style={styles.temperature}>{weather.temperature}°C</Text>
          </View>
          <View style={styles.windRow}>
            <Ionicons
              name="cloudy"
              size={16}
              color="#FFFFFF"
              style={styles.smallIcon}
            />
            <Text style={styles.windText}>Vind: {weather.windSpeed} m/s</Text>
          </View>
        </View>
      )}

      {/* Location Section (Right) */}
      {showLocation && (
        <View style={styles.locationSection}>
          <View style={styles.locationRow}>
            <Ionicons
              name="location"
              size={16}
              color="#FFFFFF"
              style={styles.smallIcon}
            />
            <Text style={styles.locationText}>Aktuel placering:</Text>
          </View>
          <Text style={styles.locationName}>{location}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30, 63, 64, 0.9)', // Dark Petrol with opacity
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md, // 16px
    paddingVertical: SPACING.sm,   // 8px
    minHeight: 60,
  },
  weatherSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  weatherIcon: {
    marginRight: 8,
  },
  temperature: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 24, // Open Sans Semibold, 24px
    fontWeight: '600',
    color: '#FFFFFF',
  },
  windRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallIcon: {
    marginRight: 4,
  },
  windText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 14, // Open Sans Regular, 14px
    fontWeight: '400',
    color: '#FFFFFF',
  },
  locationSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 14, // Open Sans Regular, 14px
    fontWeight: '400',
    color: '#FFFFFF',
  },
  locationName: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 14, // Open Sans Regular, 14px
    fontWeight: '400',
    color: '#FFFFFF',
  },
});
