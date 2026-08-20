import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { useWeatherLocation } from '../contexts/WeatherLocationContext';
import { calculateTideAndBite } from '../data/tideEngine';

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
      <LinearGradient
        colors={['#0A2540', '#14385C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, { paddingTop: insets.top + SPACING.xs }]}
      >
        <ActivityIndicator size="small" color="#00D4B2" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0A2540', '#14385C']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + SPACING.xs }]}
    >
      {/* Weather Section (Left) */}
      {showWeather && weather && (
        <View style={styles.weatherSection}>
          <View style={styles.weatherRow}>
            <Ionicons
              name={getWeatherIcon(weather.icon)}
              size={22}
              color="#00D4B2"
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
              name="cloudy-outline"
              size={14}
              color="#7A94B0"
              style={styles.smallIcon}
            />
            <Text style={styles.windText} accessibilityLabel={`Vindhastighed: ${weather.windSpeed} meter per sekund`}>
              Vind {weather.windSpeed} m/s
            </Text>
          </View>
        </View>
      )}

      {/* Center Section - Tide & Bite Chance + Notifications */}
      {(() => {
        const tide = calculateTideAndBite();
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity
              onPress={() => router.push('/predictions')}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: 'rgba(0, 212, 178, 0.15)',
                paddingHorizontal: 8,
                paddingVertical: 5,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(0, 212, 178, 0.3)',
              }}
            >
              <Ionicons name="water" size={12} color="#00D4B2" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#00D4B2' }}>
                {tide.phase === 'rising' ? 'Flod' : tide.phase === 'falling' ? 'Ebbe' : 'Skifte'}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#F5A623', marginLeft: 2 }}>
                {tide.biteChanceScore}%
              </Text>
            </TouchableOpacity>

            {showNotifications && (
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => router.push('/notifications')}
                accessible={true}
                accessibilityLabel={`Notifikationer. ${unreadCount} ulæste`}
                accessibilityRole="button"
                activeOpacity={0.8}
              >
                <View style={styles.notificationIconWrap}>
                  <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
                  {unreadCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>
        );
      })()}

      {/* Location Section (Right) */}
      {showLocation && (
        <View style={styles.locationSection}>
          <View style={styles.locationRow}>
            <Ionicons
              name="location"
              size={14}
              color="#F5A623"
              style={styles.smallIcon}
            />
            <Text style={styles.locationLabel}>Spot</Text>
          </View>
          <Text
            style={styles.locationName}
            numberOfLines={1}
            ellipsizeMode="tail"
            accessibilityLabel={`Placering: ${location}`}
          >
            {location}
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  weatherSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  weatherIcon: {
    marginRight: 6,
  },
  temperature: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  windRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallIcon: {
    marginRight: 4,
  },
  windText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  locationSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F5A623',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    maxWidth: 140,
  },
  notificationButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  notificationIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#F5A623',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0A2540',
    ...SHADOWS.glow,
  },
  notificationBadgeText: {
    color: '#0A2540',
    fontSize: 10,
    fontWeight: '800',
  },
});
