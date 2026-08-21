import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { FishingLocation } from '../data/fishingLocations';
import { generateSpotTactics } from '../data/spotTacticsEngine';
import TideChartWidget from './TideChartWidget';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SpotTacticsModalProps {
  visible: boolean;
  onClose: () => void;
  spot: FishingLocation | null;
  weather?: { temperature?: number; windSpeed?: number; windDirection?: string; pressure?: number };
}

export default function SpotTacticsModal({
  visible,
  onClose,
  spot,
  weather,
}: SpotTacticsModalProps) {
  const { colors, isDark } = useTheme();
  const { isPro } = useSubscription();
  const router = useRouter();

  if (!spot) return null;

  const tactics = generateSpotTactics(spot, weather);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: isDark ? '#071524' : '#FFFFFF',
              borderColor: isDark ? 'rgba(0, 212, 178, 0.3)' : 'rgba(0, 212, 178, 0.2)',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View style={styles.iconCircle}>
                <Ionicons name="sparkles" size={20} color="#00D4B2" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                  Kyst-Taktik: {spot.name}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  AI Taktiker baseret på aktuelle vejrforhold
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onClose();
              }}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Score & Golden Hour Banner */}
            <LinearGradient
              colors={['rgba(0, 212, 178, 0.18)', 'rgba(245, 166, 35, 0.12)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scoreBanner}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.scoreValue}>{tactics.overallScore}%</Text>
                <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Bide-Score</Text>
              </View>
              <View style={styles.divider} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.goldenHourTitle, { color: '#F5A623' }]}>★ Gyldne Hug-Tidspunkt</Text>
                <Text style={[styles.goldenHourText, { color: colors.text }]}>{tactics.goldenHour}</Text>
              </View>
            </LinearGradient>

            {/* Live DMI Water Level & Tidal Curve */}
            <TideChartWidget latitude={spot.latitude} longitude={spot.longitude} />

            {/* Tactical Weather Advice */}
            <View style={[styles.card, { backgroundColor: isDark ? '#0A1E34' : '#F8FAFC' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Ionicons name="compass-outline" size={18} color="#00D4B2" />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Pladsens Affiskning</Text>
              </View>
              <Text style={[styles.adviceText, { color: colors.text }]}>{tactics.weatherAdvice}</Text>
              {tactics.tideAdvice && (
                <Text style={[styles.tideText, { color: '#00D4B2' }]}>🌊 {tactics.tideAdvice}</Text>
              )}
            </View>

            {!isPro ? (
              <View style={[styles.card, { backgroundColor: isDark ? '#0A1E34' : '#F8FAFC', borderColor: '#F5A623', borderWidth: 1.5, alignItems: 'center', padding: 20, marginTop: 10 }]}>
                <Ionicons name="lock-closed" size={32} color="#F5A623" style={{ marginBottom: 8 }} />
                <Text style={[styles.title, { color: colors.text, textAlign: 'center' }]}>Lås op for AI Spot-Taktik 👑</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 14 }]}>
                  Få præcise agnvalg, farvekombinationer og indspinningshastigheder skræddersyet til {spot.name} med Hook Pro.
                </Text>
                <TouchableOpacity
                  style={{ borderRadius: 12, overflow: 'hidden', width: '100%' }}
                  onPress={() => {
                    onClose();
                    router.push('/upgrade-pro' as any);
                  }}
                  activeOpacity={0.85}
                >
                  <LinearGradient colors={['#F5A623', '#D97706']} style={{ paddingVertical: 12, alignItems: 'center' }}>
                    <Text style={{ color: '#071524', fontWeight: '900', fontSize: 13 }}>Prøv Hook Pro Gratis i 7 Dage 👑</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Recommended Lures (Agnvalg) */}
                <Text style={[styles.sectionHeading, { color: colors.text }]}>Anbefalet Endegrej Lige Nu</Text>
                {tactics.recommendedLures.map((lure, idx) => (
                  <View
                    key={`lure-${idx}`}
                    style={[
                      styles.lureCard,
                      { backgroundColor: isDark ? '#0A1E34' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[styles.lureName, { color: colors.text }]}>{lure.name}</Text>
                      <View style={styles.lureBadge}>
                        <Text style={styles.lureBadgeText}>{lure.type}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12, marginVertical: 4 }}>
                      <Text style={[styles.lureMeta, { color: '#00D4B2' }]}>Farve: {lure.color}</Text>
                      <Text style={[styles.lureMeta, { color: colors.textSecondary }]}>Vægt: {lure.weightSize}</Text>
                    </View>
                    <Text style={[styles.lureReason, { color: colors.textSecondary }]}>{lure.reason}</Text>
                  </View>
                ))}

                {/* Techniques */}
                <Text style={[styles.sectionHeading, { color: colors.text }]}>Fisketeknik & Indspinning</Text>
                {tactics.fishingTechniques.map((tech, idx) => (
                  <View
                    key={`tech-${idx}`}
                    style={[
                      styles.techCard,
                      { backgroundColor: isDark ? '#0A1E34' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
                    ]}
                  >
                    <Text style={[styles.techTitle, { color: '#00D4B2' }]}>{tech.technique}</Text>
                    <Text style={[styles.techProTip, { color: colors.text }]}>💡 Pro Tip: {tech.proTip}</Text>
                  </View>
                ))}
              </>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '85%',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 212, 178, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  scoreBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 178, 0.3)',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00D4B2',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 16,
  },
  goldenHourTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  goldenHourText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  card: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  adviceText: {
    fontSize: 13,
    lineHeight: 18,
  },
  tideText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  lureCard: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  lureName: {
    fontSize: 14,
    fontWeight: '800',
  },
  lureBadge: {
    backgroundColor: 'rgba(0, 212, 178, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lureBadgeText: {
    color: '#00D4B2',
    fontSize: 10,
    fontWeight: '800',
  },
  lureMeta: {
    fontSize: 12,
    fontWeight: '700',
  },
  lureReason: {
    fontSize: 11,
    lineHeight: 15,
  },
  techCard: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  techTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  techProTip: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
});
