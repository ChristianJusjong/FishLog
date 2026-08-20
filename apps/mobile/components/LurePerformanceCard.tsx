import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RADIUS, SPACING, SHADOWS, TYPOGRAPHY } from '@/constants/branding';
import { useTheme } from '../contexts/ThemeContext';

export interface LureStat {
  name: string;
  category: 'Wobler/Blink' | 'Flue' | 'Naturlig Agn' | 'Jig/Gummi';
  catchCount: number;
  topSpecies: string;
  bestWater: string;
  efficiencyScore: number; // 0 - 100%
}

interface LurePerformanceCardProps {
  lureStats?: LureStat[];
}

export default function LurePerformanceCard({ lureStats }: LurePerformanceCardProps) {
  const { colors } = useTheme();

  // Default sample performance dataset if user has just started
  const stats: LureStat[] = lureStats && lureStats.length > 0 ? lureStats : [
    {
      name: 'Savage Gear Sandeel 19g (Kobber/Guld)',
      category: 'Wobler/Blink',
      catchCount: 16,
      topSpecies: 'Havørred',
      bestWater: 'Kyst & Fjord',
      efficiencyScore: 92,
    },
    {
      name: 'Mepps Aglia Str. 3 (Sølv/Rød)',
      category: 'Wobler/Blink',
      catchCount: 11,
      topSpecies: 'Aborre',
      bestWater: 'Sø & Å',
      efficiencyScore: 84,
    },
    {
      name: 'Pattegrisen Flue (Lyserød/Grizzly)',
      category: 'Flue',
      catchCount: 8,
      topSpecies: 'Havørred',
      bestWater: 'Kyst',
      efficiencyScore: 78,
    },
    {
      name: 'Westin ShadTeez 9cm (Bass Orange)',
      category: 'Jig/Gummi',
      catchCount: 7,
      topSpecies: 'Sandart',
      bestWater: 'Dyb Sø',
      efficiencyScore: 75,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <LinearGradient
            colors={['#F5A623', '#D4880F']}
            style={styles.iconBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="hardware-chip" size={18} color="#0A2540" />
          </LinearGradient>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Agn-Effektivitet (Lure ROI)</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Dine mest fangstgivende agn og hit-rates
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.list}>
        {stats.map((lure, index) => (
          <View
            key={lure.name}
            style={[
              styles.itemRow,
              {
                backgroundColor: colors.backgroundLight,
                borderColor: index === 0 ? 'rgba(245, 166, 35, 0.4)' : colors.border,
              },
            ]}
          >
            {/* Rank Number */}
            <View
              style={[
                styles.rankBadge,
                { backgroundColor: index === 0 ? '#F5A623' : colors.primaryLight + '25' },
              ]}
            >
              <Text
                style={[
                  styles.rankText,
                  { color: index === 0 ? '#0A2540' : colors.primary },
                ]}
              >
                #{index + 1}
              </Text>
            </View>

            {/* Lure Info */}
            <View style={styles.infoCol}>
              <Text style={[styles.lureName, { color: colors.text }]} numberOfLines={1}>
                {lure.name}
              </Text>
              <View style={styles.metaRow}>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  🐟 {lure.topSpecies}
                </Text>
                <Text style={[styles.metaDot, { color: colors.textSecondary }]}>•</Text>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  🌊 {lure.bestWater}
                </Text>
              </View>
            </View>

            {/* Catch Count & Efficiency */}
            <View style={styles.scoreCol}>
              <Text style={[styles.catchCount, { color: colors.primary }]}>
                {lure.catchCount} <Text style={{ fontSize: 11, fontWeight: '500' }}>fisk</Text>
              </Text>
              <View style={styles.scorePill}>
                <Ionicons name="trending-up" size={11} color="#10B981" />
                <Text style={styles.scoreText}>{lure.efficiencyScore}% hit</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...SHADOWS.sm,
  },
  header: {
    marginBottom: SPACING.md,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.styles.h3,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  list: {
    gap: SPACING.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
  },
  infoCol: {
    flex: 1,
  },
  lureName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 10,
  },
  scoreCol: {
    alignItems: 'flex-end',
  },
  catchCount: {
    fontSize: 14,
    fontWeight: '800',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#10B98115',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
});
