import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '@/constants/branding';
import { useWeatherLocation } from '../contexts/WeatherLocationContext';

interface WeatherLocationCardProps {
  showLocation?: boolean;
  showWeather?: boolean;
  showNotifications?: boolean;
}

export default function WeatherLocationCard({
  showLocation = true,
  showWeather = true,
  showNotifications = true
}: WeatherLocationCardProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { location, weather, unreadCount, loading } = useWeatherLocation();

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
      <View style={[styles.container, { paddingTop: insets.top + SPACING.sm }]}>
        <ActivityIndicator size="small" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.sm }]}>
      {/* Weather Section (Left) */}
      {showWeather && weather && (
        <View style={styles.weatherSection}>
          <View style={styles.weatherRow}>
            <Ionicons
              name={getWeatherIcon(weather.icon)}
              size={24}
              color="#FFFFFF"
              style={styles.weatherIcon}
              accessible={true}
              accessibilityLabel={`Vejr: ${weather.description}`}
            />
            <Text style={styles.temperature} accessibilityLabel={`Temperatur: ${weather.temperature} grader celsius`}>
              {weather.temperature}°C
            </Text>
          </View>
          <View style={styles.windRow}>
            <Ionicons
              name="cloudy"
              size={16}
              color="#FFFFFF"
              style={styles.smallIcon}
            />
            <Text style={styles.windText} accessibilityLabel={`Vindhastighed: ${weather.windSpeed} meter per sekund`}>
              Vind: {weather.windSpeed} m/s
            </Text>
          </View>
        </View>
      )}

      {/* Center Section - Notifications */}
      {showNotifications && (
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
          accessible={true}
          accessibilityLabel={`Notifikationer. ${unreadCount} ulæste`}
          accessibilityRole="button"
        >
          <Ionicons name="notifications" size={24} color="#FFFFFF" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
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
          <Text style={styles.locationName} accessibilityLabel={`Placering: ${location}`}>
            {location}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary, // Deep Forest Green
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
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
  notificationButton: {
    position: 'relative',
    padding: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
