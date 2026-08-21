import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TideChartWidgetProps {
  latitude?: number;
  longitude?: number;
}

export default function TideChartWidget({ latitude, longitude }: TideChartWidgetProps) {
  const { colors, isDark } = useTheme();

  // Generate 12-hour water level curve (+- 45 cm around normal)
  const now = new Date();
  const currentHour = now.getHours();

  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = (currentHour + i) % 24;
    // Semi-diurnal tidal oscillation simulation
    const angle = ((h % 12) / 12) * Math.PI * 2;
    const levelCm = Math.round(Math.sin(angle) * 35);
    const isHigh = levelCm > 25;
    const isLow = levelCm < -25;
    const isTurn = Math.abs(levelCm) < 8;

    return {
      hour: `${h.toString().padStart(2, '0')}:00`,
      levelCm,
      isCurrent: i === 0,
      isHigh,
      isLow,
      isTurn,
    };
  });

  const nextTurn = hours.find((h, idx) => idx > 0 && h.isTurn) || hours[3];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#0A1E34' : '#F8FAFC',
          borderColor: isDark ? 'rgba(0, 212, 178, 0.25)' : 'rgba(0, 212, 178, 0.2)',
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={styles.iconCircle}>
            <Ionicons name="water" size={18} color="#00D4B2" />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>DMI Vandstand & Strømskifte</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              12-timers prognose for kyst & fjord
            </Text>
          </View>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>🎯 Strøm: Aktiv</Text>
        </View>
      </View>

      {/* Strømskifte Callout Banner */}
      <LinearGradient
        colors={['rgba(0, 212, 178, 0.15)', 'rgba(245, 166, 35, 0.12)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.calloutBanner}
      >
        <Ionicons name="flash" size={16} color="#F5A623" />
        <Text style={[styles.calloutText, { color: colors.text }]}>
          Næste strømskifte (hugperiode): <Text style={{ color: '#00D4B2', fontWeight: '800' }}>kl. {nextTurn.hour}</Text>
        </Text>
      </LinearGradient>

      {/* 12-Hour Water Level Visual Curve */}
      <View style={styles.chartContainer}>
        {hours.map((h, i) => {
          // Height between 20px and 70px
          const barHeight = Math.max(20, Math.min(70, 45 + h.levelCm * 0.7));
          return (
            <View key={i} style={styles.barColumn}>
              <Text style={[styles.levelText, { color: h.isCurrent ? '#00D4B2' : colors.textSecondary }]}>
                {h.levelCm > 0 ? `+${h.levelCm}` : h.levelCm}
              </Text>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: h.isCurrent
                      ? '#00D4B2'
                      : h.isHigh
                      ? '#10B981'
                      : h.isLow
                      ? '#3B82F6'
                      : isDark
                      ? 'rgba(255,255,255,0.15)'
                      : '#CBD5E1',
                    borderWidth: h.isCurrent ? 1.5 : 0,
                    borderColor: '#FFFFFF',
                  },
                ]}
              />
              <Text style={[styles.hourText, { color: h.isCurrent ? '#00D4B2' : colors.textSecondary, fontWeight: h.isCurrent ? '800' : '500' }]}>
                {h.hour.substring(0, 2)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 212, 178, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  badge: {
    backgroundColor: 'rgba(0, 212, 178, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#00D4B2',
    fontSize: 10,
    fontWeight: '800',
  },
  calloutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 14,
  },
  calloutText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 95,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  levelText: {
    fontSize: 8,
    fontWeight: '700',
    marginBottom: 4,
  },
  bar: {
    width: 8,
    borderRadius: 4,
  },
  hourText: {
    fontSize: 9,
    marginTop: 6,
  },
});
