import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

export interface SponsoredAdData {
  id: string;
  sponsorName: string;
  sponsorAvatar?: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  targetUrl: string;
  tag?: string;
}

const DEFAULT_SPONSORED_ADS: SponsoredAdData[] = [
  {
    id: 'sponsor-1',
    sponsorName: 'GrejXperten Danmark',
    title: 'Kyst-Kampagne: Spar 20% på gennemløbere & blink',
    description: 'Optimer dit efterårsfiskeri efter havørred med Danmarks mest populære tobis-imitationer.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1000&auto=format&fit=crop',
    ctaText: 'Se Kyst-Tilbud ↗',
    targetUrl: 'https://grejxperten.dk',
    tag: 'Grej & Udstyr',
  },
  {
    id: 'sponsor-2',
    sponsorName: 'Kyst & Fjord Fiskeri',
    title: 'Nye Åndbare Waders til Kystsæsonen',
    description: 'Hold dig tør og varm på de lange vadeture langs de danske kyster og fjorde.',
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?q=80&w=1000&auto=format&fit=crop',
    ctaText: 'Find Din Størrelse ↗',
    targetUrl: 'https://kystogfjord.dk',
    tag: 'Beklædning',
  },
];

interface NativeSponsoredCardProps {
  ad?: SponsoredAdData;
}

export default function NativeSponsoredCard({ ad = DEFAULT_SPONSORED_ADS[0] }: NativeSponsoredCardProps) {
  const { colors, isDark } = useTheme();

  const handlePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      if (ad.targetUrl) {
        await Linking.openURL(ad.targetUrl);
      }
    } catch (e) {
      console.warn('Failed to open sponsor URL:', e);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? 'rgba(245, 166, 35, 0.25)' : 'rgba(245, 166, 35, 0.35)',
        },
      ]}
    >
      {/* Sponsor Header */}
      <View style={styles.header}>
        <View style={styles.sponsorInfo}>
          <View style={[styles.avatarBadge, { backgroundColor: 'rgba(245, 166, 35, 0.15)' }]}>
            <Ionicons name="pricetag" size={16} color="#F5A623" />
          </View>
          <View>
            <Text style={[styles.sponsorName, { color: colors.text }]}>{ad.sponsorName}</Text>
            <Text style={[styles.sponsoredBadge, { color: colors.textSecondary }]}>Sponsoreret partner</Text>
          </View>
        </View>

        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{ad.tag || 'Annonce'}</Text>
        </View>
      </View>

      {/* Ad Image */}
      {ad.imageUrl && (
        <TouchableOpacity activeOpacity={0.9} onPress={handlePress} style={styles.imageContainer}>
          <Image
            source={{ uri: ad.imageUrl }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </TouchableOpacity>
      )}

      {/* Content & Copy */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{ad.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{ad.description}</Text>

        {/* Seamless CTA Button */}
        <TouchableOpacity style={styles.ctaButton} onPress={handlePress} activeOpacity={0.85}>
          <LinearGradient
            colors={['#F5A623', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>{ad.ctaText}</Text>
            <Ionicons name="arrow-forward" size={16} color="#071524" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  sponsorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sponsorName: {
    fontSize: 14,
    fontWeight: '800',
  },
  sponsoredBadge: {
    fontSize: 11,
    marginTop: 1,
  },
  tagBadge: {
    backgroundColor: 'rgba(245, 166, 35, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.25)',
  },
  tagText: {
    color: '#F5A623',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  imageContainer: {
    width: '100%',
    height: 190,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  ctaButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  ctaText: {
    color: '#071524',
    fontSize: 13,
    fontWeight: '900',
  },
});
