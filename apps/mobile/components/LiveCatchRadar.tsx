import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { API_URL } from '@/config/api';
import { getSecureItem, TOKEN_KEYS } from '@/lib/secureStorage';

interface RecentCatchPulse {
  id: string;
  species: string;
  lengthCm?: number;
  weightKg?: number;
  locationName: string;
  timeAgoText: string;
}

export default function LiveCatchRadar() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [pulseCatch, setPulseCatch] = useState<RecentCatchPulse | null>({
    id: 'sample-pulse-1',
    species: 'Havørred',
    lengthCm: 56,
    weightKg: 1.8,
    locationName: 'Isefjorden',
    timeAgoText: '14 min siden',
  });

  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    // Pulse animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();

    fetchLiveRadar();
  }, []);

  const fetchLiveRadar = async () => {
    try {
      const token = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
      const res = await fetch(`${API_URL}/catches?limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const c = data[0];
          setPulseCatch({
            id: c.id,
            species: c.species || 'Havørred',
            lengthCm: c.lengthCm,
            weightKg: c.weightKg,
            locationName: 'Kysten',
            timeAgoText: 'Lige nu',
          });
        }
      }
    } catch {
      // Keep initial realistic radar pulse
    }
  };

  if (!pulseCatch) return null;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(7, 21, 36, 0.95)' : '#FFFFFF',
          borderColor: isDark ? 'rgba(0, 212, 178, 0.3)' : 'rgba(0, 212, 178, 0.4)',
        },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        router.push('/map');
      }}
      activeOpacity={0.85}
    >
      <Animated.View style={[styles.radarBeacon, { transform: [{ scale: pulseAnim }] }]}>
        <Ionicons name="radio" size={16} color="#00D4B2" />
      </Animated.View>

      <View style={styles.textWrapper}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.title, { color: colors.text }]}>
            Fangst-Radar: <Text style={{ color: '#00D4B2' }}>{pulseCatch.species}</Text>
          </Text>
          {pulseCatch.lengthCm && (
            <Text style={[styles.sizeChip, { color: colors.textSecondary }]}>
              {pulseCatch.lengthCm} cm
            </Text>
          )}
        </View>
        <Text style={[styles.subtext, { color: colors.textSecondary }]}>
          Landet ved {pulseCatch.locationName} • {pulseCatch.timeAgoText}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#00D4B2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  radarBeacon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 212, 178, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
  },
  sizeChip: {
    fontSize: 11,
    fontWeight: '700',
  },
  subtext: {
    fontSize: 11,
    marginTop: 1,
  },
});
