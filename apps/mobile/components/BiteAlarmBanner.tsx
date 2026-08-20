import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { getSecureItem, TOKEN_KEYS } from '@/lib/secureStorage';
import { API_URL } from '@/config/api';

interface BiteAlarm {
  spotId: string;
  spotName: string;
  optimalTime: string;
  score: number;
  condition: string;
  targetSpecies: string[];
  recommendation: string;
}

export default function BiteAlarmBanner() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [alarms, setAlarms] = useState<BiteAlarm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBiteAlarms();
  }, []);

  const fetchBiteAlarms = async () => {
    try {
      setLoading(true);
      const token = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
      const response = await fetch(`${API_URL}/notifications/bite-alarms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlarms(data);
      }
    } catch (error) {
      console.error('Failed to fetch bite alarms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || alarms.length === 0) {
    return null;
  }

  const topAlarm = alarms[0];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(0, 212, 178, 0.12)' : 'rgba(0, 212, 178, 0.08)',
          borderColor: '#00D4B2',
        },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        router.push('/favorite-spots');
      }}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="alarm" size={14} color="#071524" />
          <Text style={styles.badgeText}>Bide-Alarm {topAlarm.score}%</Text>
        </View>
        <Text style={[styles.spotName, { color: colors.text }]}>{topAlarm.spotName}</Text>
      </View>

      <Text style={[styles.condition, { color: '#00D4B2' }]}>{topAlarm.condition}</Text>
      <Text style={[styles.recommendation, { color: colors.textSecondary }]} numberOfLines={2}>
        {topAlarm.recommendation}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00D4B2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#071524',
    fontSize: 11,
    fontWeight: '900',
  },
  spotName: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  condition: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  recommendation: {
    fontSize: 11,
    lineHeight: 16,
  },
});
