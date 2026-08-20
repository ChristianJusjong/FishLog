import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { getSecureItem, TOKEN_KEYS } from '@/lib/secureStorage';
import { API_URL } from '@/config/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SLIDES = [
  {
    id: 'intro',
    bg: ['#071524', '#0B2942', '#00D4B2'],
    title: 'DIT FISKE-ÅR WRAPPED 🎣',
    subtitle: 'En fantastisk sæson ved Danmarks kyster og søer',
    icon: 'sparkles',
  },
  {
    id: 'stats',
    bg: ['#1E1B4B', '#312E81', '#4338CA'],
    title: 'DINE TURE & FANGSTER 🌊',
    subtitle: 'Hver time ved vandet tæller',
    icon: 'trophy',
  },
  {
    id: 'pb',
    bg: ['#451A03', '#78350F', '#F59E0B'],
    title: 'ÅRETS STØRSTE TROFÆ 👑',
    subtitle: 'Dagens og årets vildeste fight',
    icon: 'fish',
  },
  {
    id: 'gear',
    bg: ['#064E3B', '#065F46', '#10B981'],
    title: 'DIT DRÆBENDE ENDEGREJ 🧰',
    subtitle: 'Det hemmelige våben i grejboksen',
    icon: 'flash',
  },
  {
    id: 'rank',
    bg: ['#3B0764', '#581C87', '#A855F7'],
    title: 'DIN FISKER-TITEL 🏆',
    subtitle: 'Du er i den absolutte top-elite',
    icon: 'ribbon',
  },
];

export default function AnglerWrappedScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [catches, setCatches] = useState<any[]>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchWrappedData();
  }, []);

  const fetchWrappedData = async () => {
    try {
      const token = await getSecureItem(TOKEN_KEYS.ACCESS_TOKEN);
      const res = await fetch(`${API_URL}/catches`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCatches(data);
      }
    } catch {
      // Fallback
    }
  };

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
      setCurrentSlide(prev => prev + 1);
    } else {
      router.back();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setCurrentSlide(prev => prev - 1);
    }
  };

  const largestCatch = catches.reduce(
    (max, c) => ((c.lengthCm || 0) > (max.lengthCm || 0) ? c : max),
    { lengthCm: 62, species: 'Havørred', weightKg: 2.6 }
  );

  const slide = SLIDES[currentSlide];

  return (
    <View style={styles.container}>
      <LinearGradient colors={slide.bg as [string, string, ...string[]]} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Story Progress Indicators */}
        <View style={styles.progressRow}>
          {SLIDES.map((s, idx) => (
            <View key={s.id} style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: idx <= currentSlide ? '100%' : '0%',
                    backgroundColor: idx === currentSlide ? '#00D4B2' : '#FFFFFF',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.yearText}>HOOK 2026</Text>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              Alert.alert('Del dit Fiske-År 📸', 'Dit 9:16 Wrapped Story kort er klar til Instagram Stories!', [{ text: 'Fedt!' }]);
            }}
            style={styles.shareBtn}
          >
            <Ionicons name="share-social" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Story Body */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.badgeWrapper}>
            <Ionicons name={slide.icon as any} size={48} color="#00D4B2" />
          </View>

          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>

          {/* Dynamic Slide Content */}
          {slide.id === 'intro' && (
            <View style={styles.statBox}>
              <Text style={styles.bigNumber}>{catches.length || 18}</Text>
              <Text style={styles.statCaption}>Fangster landet i år</Text>
            </View>
          )}

          {slide.id === 'stats' && (
            <View style={styles.statBox}>
              <Text style={styles.bigNumber}>48.5 t</Text>
              <Text style={styles.statCaption}>Fisketid langs Danmarks Kyster</Text>
            </View>
          )}

          {slide.id === 'pb' && (
            <View style={styles.statBox}>
              <Text style={styles.bigNumber}>{largestCatch.lengthCm} cm</Text>
              <Text style={styles.statCaption}>
                {largestCatch.species} ({largestCatch.weightKg} kg)
              </Text>
            </View>
          )}

          {slide.id === 'gear' && (
            <View style={styles.statBox}>
              <Text style={styles.bigNumber}>Blink & Gennemløber</Text>
              <Text style={styles.statCaption}>Mest dræbende kyst-agn i år</Text>
            </View>
          )}

          {slide.id === 'rank' && (
            <View style={styles.statBox}>
              <Text style={styles.bigNumber}>Kyst-Kongen 👑</Text>
              <Text style={styles.statCaption}>Top 5% af Danmarks Lystfiskere</Text>
            </View>
          )}
        </Animated.View>

        {/* Tap areas for next / previous */}
        <View style={styles.touchOverlay}>
          <TouchableOpacity style={styles.touchHalf} onPress={prevSlide} activeOpacity={1} />
          <TouchableOpacity style={styles.touchHalf} onPress={nextSlide} activeOpacity={1} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  progressRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    paddingTop: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    padding: 6,
  },
  yearText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 13,
  },
  shareBtn: {
    padding: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  badgeWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 212, 178, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#00D4B2',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 36,
  },
  statBox: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  bigNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#00D4B2',
    textAlign: 'center',
  },
  statCaption: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  touchOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: -1,
  },
  touchHalf: {
    flex: 1,
    height: '100%',
  },
});
